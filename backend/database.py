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
        ("K8S-INGRESS-CLUSTER-01", "10.0.7.10",    "Kubernetes Ingress (Traefik)", "Alpine 3.19 / K8s v1.28", "Mission Critical", "Internet Facing",   "Cloud Platform Sec",   "AWS us-east-1 / K8s VPC"),
        ("AI-INFERENCE-GATEWAY-01","10.0.8.99",    "LLM Model Gateway (vLLM)", "Ubuntu 22.04 LTS / CUDA 12", "Mission Critical", "DMZ",              "AI Research Sec",      "Azure East US (GPU Hub)"),
        ("FIN-REDIS-CACHE-01",     "172.16.10.12", "Distributed In-Memory Cache", "Debian 12 / Redis 7.2",   "High",             "Internal Subnet",       "Financial Core Team",  "HQ Private Datacenter"),
        ("CORP-PALO-ALTO-FW-02",   "10.0.0.1",     "NextGen Perimeter FW",     "PAN-OS 11.0",               "Mission Critical", "Internet Facing",       "SecOps Defense",       "Tokyo Edge Gateway"),
        ("DEV-SANDBOX-AIRGAP-01",  "192.168.99.5", "Isolated R&D Sandbox",     "CentOS Stream 9",           "Low",              "Air-Gapped",            "R&D Intern Lab",       "Isolated Offline Testbed"),
    ]
    cursor.executemany(
        "INSERT INTO assets (name, ip_address, asset_type, os_info, criticality, exposure, owner, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        assets_data
    )
    vulns_data = [
        (
            "CVE-2023-22515",
            "Atlassian Confluence Broken Access Control — Admin Account Creation",
            "Unauthenticated remote attacker can create administrator account via exposed /setup/setupadministrator.action endpoint.",
            10.0, "CWE-284 (Improper Access Control)", 0.974, 1,
            "Atlassian Confluence 8.0–8.5.x",
            "1. Upgrade to Confluence 8.5.2+. 2. Block /setup/* via WAF rule.",
            "# Block Confluence setup endpoint\nsudo nginx -t && cat >> /etc/nginx/snippets/security.conf << 'EOF'\nlocation ~ ^/setup/ {\n    deny all;\n}\nEOF\nsudo nginx -s reload"
        ),
        (
            "CVE-2021-44228",
            "Apache Log4j2 JNDI Remote Code Execution (Log4Shell)",
            "Log4j2 JNDI lookup feature allows attacker to execute arbitrary code via crafted LDAP/RMI message.",
            10.0, "CWE-917 (JNDI Injection)", 0.976, 1,
            "Apache Log4j-core 2.0-beta9 through 2.14.1",
            "1. Upgrade log4j-core to 2.17.1. 2. Set JVM flag -Dlog4j2.formatMsgNoLookups=true.",
            "# JVM flag mitigation\nexport JAVA_OPTS=\"$JAVA_OPTS -Dlog4j2.formatMsgNoLookups=true\"\nmvn versions:use-dep-version -Dincludes=org.apache.logging.log4j:log4j-core -DdepVersion=2.17.1"
        ),
        (
            "CVE-2023-4966",
            "Citrix Bleed — NetScaler Buffer Overflow Session Token Leak",
            "Buffer overflow in NetScaler ADC allows unauthenticated attacker to extract valid session tokens bypassing MFA.",
            9.4, "CWE-119 (Buffer Overflow)", 0.961, 1,
            "Citrix NetScaler ADC/Gateway 13.x, 12.x",
            "1. Upgrade NetScaler to 14.1-8.50+. 2. Kill active sessions post-patch.",
            "# Terminate active ICA sessions post-patch\nnsapimgr -ys kill_sessions=1\ncli> clear lb persistentSessions\ncli> save config"
        ),
        (
            "CVE-2024-3094",
            "XZ Utils Supply Chain Backdoor — SSH Remote Code Execution",
            "Malicious code in XZ Utils creates backdoor in liblzma linked into OpenSSH allowing unauthorized root RCE.",
            10.0, "CWE-506 (Embedded Malicious Code)", 0.944, 1,
            "XZ Utils 5.6.0-5.6.1 / OpenSSH",
            "1. Downgrade xz-utils to 5.4.6. 2. Rotate SSH host keys.",
            "# Downgrade XZ Utils\nsudo apt-get install --allow-downgrades xz-utils=5.4.6-0.2 liblzma5=5.4.6-0.2\nsudo dpkg-reconfigure openssh-server"
        ),
        (
            "CVE-2022-22965",
            "Spring4Shell — Spring Framework Data Binder RCE",
            "Spring MVC on JDK 9+ allows RCE via DataBinder classloader JSP webshell upload.",
            9.8, "CWE-94 (Code Injection)", 0.714, 1,
            "Spring Framework < 5.3.18",
            "1. Upgrade Spring to 5.3.18+. 2. Restrict ClassLoader access.",
            "# Maven upgrade\n<dependency>\n  <groupId>org.springframework</groupId>\n  <artifactId>spring-webmvc</artifactId>\n  <version>5.3.18</version>\n</dependency>"
        ),
        (
            "CVE-2023-38606",
            "Apple iOS/macOS Kernel Memory Corruption — Zero-Day",
            "Zero-day kernel vulnerability exploited by Pegasus spyware. Allows kernel memory write via MMIO.",
            9.8, "CWE-787 (Out-of-bounds Write)", 0.763, 1,
            "Apple macOS < 13.5 / iOS < 16.6",
            "1. Apply macOS 13.5 security update. 2. Enable Lockdown Mode.",
            "sudo softwareupdate -i -a --restart"
        ),
        (
            "CVE-2024-21762",
            "FortiOS SSL-VPN Out-of-Bounds Write — Unauthenticated RCE",
            "Out-of-bounds write vulnerability in FortiOS SSL VPN allows unauthenticated remote code execution.",
            9.6, "CWE-787 (Out-of-bounds Write)", 0.912, 1,
            "FortiOS 7.x < 7.4.3",
            "1. Upgrade FortiOS to 7.4.3+. 2. Disable SSL-VPN if not required.",
            "config vpn ssl settings\n    set status disable\nend\nget system status"
        ),
        (
            "CVE-2023-4863",
            "libwebp Heap Buffer Overflow — Remote Code Execution",
            "Heap buffer overflow in libwebp image codec allows code execution via crafted WebP image.",
            8.8, "CWE-122 (Heap-based Buffer Overflow)", 0.822, 1,
            "libwebp < 1.3.2",
            "1. Upgrade libwebp to 1.3.2+. 2. Rebuild container images.",
            "sudo apt-get update && sudo apt-get install --only-upgrade libwebp7"
        ),
        (
            "CVE-2021-34527",
            "PrintNightmare — Windows Print Spooler RCE & LPE",
            "Windows Print Spooler allows remote code execution and local privilege escalation with SYSTEM rights.",
            8.8, "CWE-269 (Improper Privilege Management)", 0.881, 1,
            "Windows Print Spooler Service",
            "1. Apply KB5004945. 2. Disable Print Spooler on Domain Controllers.",
            "Stop-Service -Name Spooler -Force\nSet-Service -Name Spooler -StartupType Disabled"
        ),
        (
            "CVE-2024-1709",
            "ConnectWise ScreenConnect Authentication Bypass — Mass Exploitation",
            "Authentication bypass in ScreenConnect allowing unauthenticated admin access and ransomware deployment.",
            10.0, "CWE-288 (Authentication Bypass)", 0.933, 1,
            "ConnectWise ScreenConnect < 23.9.8",
            "1. Upgrade ScreenConnect to 23.9.8+. 2. Audit remote access logs.",
            "Get-ItemProperty 'HKLM:\\SOFTWARE\\ScreenConnect Software\\ScreenConnect' | Select-Object Version"
        ),
        (
            "CVE-2024-3400",
            "Palo Alto PAN-OS GlobalProtect Command Injection RCE",
            "Arbitrary command injection in GlobalProtect gateway feature allowing unauthenticated root RCE.",
            10.0, "CWE-77 (Command Injection)", 0.968, 1,
            "PAN-OS 11.1, 11.0, 10.2 GlobalProtect",
            "1. Upgrade PAN-OS to hotfix releases. 2. Apply Threat Prevention Signature 95187.",
            "# PAN-OS CLI — verify threat signature\nrequest system software check\nrequest system software install version 11.0.4-h1"
        ),
        (
            "CVE-2023-38545",
            "cURL SOCKS5 Heap Buffer Overflow",
            "Heap-based buffer overflow in SOCKS5 proxy handshake in libcurl allowing unauthenticated remote execution.",
            9.8, "CWE-122 (Heap Buffer Overflow)", 0.845, 1,
            "libcurl 7.69.0 through 8.3.0",
            "1. Upgrade curl to 8.4.0+. 2. Recompile dependent binaries.",
            "sudo apt-get update && sudo apt-get install --only-upgrade curl libcurl4"
        ),
        (
            "CVE-2023-3519",
            "Citrix ADC & Gateway Remote Code Execution",
            "Unauthenticated remote code execution on Citrix NetScaler ADC and Gateway appliances.",
            9.8, "CWE-94 (Code Injection)", 0.957, 1,
            "Citrix ADC/Gateway 13.1, 13.0",
            "1. Apply Citrix security hotfix immediately. 2. Verify gateway integrity.",
            "nsapimgr -ys kill_sessions=1\nreboot"
        ),
        (
            "CVE-2022-0847",
            "Dirty Pipe — Linux Kernel Arbitrary File Overwrite & LPE",
            "Linux kernel flaw allowing unprivileged users to overwrite data in arbitrary read-only files.",
            7.8, "CWE-269 (Privilege Escalation)", 0.812, 1,
            "Linux Kernel 5.8 through 5.16.11",
            "1. Upgrade Linux kernel to 5.16.11+, 5.15.25+, or 5.10.102+. 2. Reboot system.",
            "sudo apt-get update && sudo apt-get --only-upgrade install linux-image-generic && sudo reboot"
        ),
        (
            "CVE-2023-20198",
            "Cisco IOS XE Web UI Privilege Escalation — Zero-Day",
            "Active exploitation allowing attacker to create level 15 privilege account on Cisco IOS XE devices.",
            10.0, "CWE-306 (Missing Authentication)", 0.965, 1,
            "Cisco IOS XE with Web UI enabled",
            "1. Disable HTTP Server feature on all internet-facing devices.",
            "# Cisco CLI\nno ip http server\nno ip http secure-server\nwrite memory"
        ),
        (
            "CVE-2023-46604",
            "Apache ActiveMQ OpenWire Remote Code Execution",
            "Allows remote attacker to execute arbitrary shell commands via ClassPathXmlApplicationContext injection.",
            9.8, "CWE-502 (Deserialization of Untrusted Data)", 0.923, 1,
            "Apache ActiveMQ < 5.18.3",
            "1. Upgrade ActiveMQ to 5.18.3+. 2. Restrict OpenWire port 61616 to internal CIDR.",
            "sudo systemctl stop activemq\nwget https://archive.apache.org/dist/activemq/5.18.3/apache-activemq-5.18.3-bin.tar.gz"
        ),
    ]
    cursor.executemany(
        """INSERT INTO vulnerabilities
        (cve_id, title, description, cvss_score, cwe_id, epss_score, exploit_available, affected_component, remediation_steps, patch_script)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        vulns_data
    )
    findings = [
        (1,  2, "OPEN"),  # PROD-WEB Log4Shell
        (4,  3, "OPEN"),  # CITRIX Citrix Bleed
        (5,  9, "OPEN"),  # WIN-DC PrintNightmare
        (9,  7, "OPEN"),  # FORTIOS VPN RCE
        (14, 11, "OPEN"), # PALO ALTO GlobalProtect RCE
        (11, 12, "OPEN"), # K8S cURL Overflow
        (3,  1, "OPEN"),  # CONFLUENCE Admin Creation
        (2,  2, "OPEN"),  # PROD-DB Log4j2
        (12, 16, "OPEN"), # AI-INFERENCE ActiveMQ RCE
        (10, 9, "OPEN"),  # MAIL-EXCHANGE PrintNightmare
        (13, 14, "OPEN"), # REDIS Dirty Pipe LPE
        (6,  5, "OPEN"),  # SCADA Spring4Shell
        (7,  8, "OPEN"),  # STAGING libwebp
        (1,  4, "OPEN"),  # PROD-WEB XZ Utils Backdoor
        (3,  6, "OPEN"),  # CONFLUENCE iOS/macOS Kernel
        (8,  8, "OPEN"),  # DEV-BUILD libwebp
        (4,  10, "OPEN"), # CITRIX ScreenConnect
        (2,  1, "OPEN"),  # PROD-DB Confluence Admin
        (11, 15, "OPEN"), # K8S Cisco IOS XE
        (12, 13, "OPEN"), # AI-INFERENCE Citrix ADC RCE
        (15, 8, "OPEN"),  # AIRGAP Sandbox libwebp (Low Risk derated by airgap!)
        (15, 2, "OPEN"),  # AIRGAP Sandbox Log4Shell (Low Risk derated by airgap!)
    ]
    cursor.executemany(
        "INSERT INTO asset_vulnerabilities (asset_id, vulnerability_id, status) VALUES (?, ?, ?)",
        findings
    )
    conn.commit()

init_db()
