"""
CyberShield AI — Deep Scan Log Generator
Generates ~2000 realistic log lines mimicking real Nmap + OpenVAS + NVD pipeline output.
"""

import random
import time as _time

# ── Simulated network topology ──
HOSTS = [
    {"ip": "10.0.1.50",    "name": "PROD-WEB-SERVER-01",   "os": "Linux 5.15",           "os_full": "Ubuntu 22.04 LTS",        "mac": "00:50:56:AB:12:34", "vendor": "VMware",        "latency": "2.31",  "ttl": 64},
    {"ip": "10.0.2.105",   "name": "PROD-DB-POSTGRES-01",  "os": "Linux 5.4",            "os_full": "RHEL 9.1 PostgreSQL",     "mac": "00:50:56:AB:22:11", "vendor": "VMware",        "latency": "3.14",  "ttl": 64},
    {"ip": "10.0.3.200",   "name": "CORP-CONFLUENCE-01",   "os": "Linux 5.15",           "os_full": "Oracle Linux 8.8",        "mac": "00:0C:29:F1:44:AA", "vendor": "VMware",        "latency": "5.82",  "ttl": 64},
    {"ip": "10.0.4.12",    "name": "CORP-CITRIX-GW-01",    "os": "NetScaler 13.1",       "os_full": "Citrix ADC 13.1-49.13",   "mac": "00:0C:29:C2:88:BB", "vendor": "Citrix",        "latency": "4.09",  "ttl": 64},
    {"ip": "172.16.0.5",   "name": "FIN-WIN-DC-01",        "os": "Windows Server 2022",  "os_full": "Windows Server 2022 STD", "mac": "00:50:56:CC:77:DD", "vendor": "VMware",        "latency": "1.93",  "ttl": 128},
    {"ip": "172.16.80.4",  "name": "SCADA-PLC-GATEWAY-09", "os": "Linux 4.14",           "os_full": "Embedded Linux 4.14.202", "mac": "AA:BB:CC:11:22:33", "vendor": "Siemens",       "latency": "8.21",  "ttl": 64},
    {"ip": "10.0.5.88",    "name": "STAGING-API-NODE-03",  "os": "Linux 5.10",           "os_full": "Debian 12 / Node 20 LTS", "mac": "00:50:56:FF:11:22", "vendor": "VMware",        "latency": "4.55",  "ttl": 64},
    {"ip": "192.168.20.14","name": "DEV-BUILD-RUNNER-02",  "os": "Linux 5.4",            "os_full": "Ubuntu 20.04 LTS",        "mac": "DE:AD:BE:EF:00:01", "vendor": "PCS Systemtec", "latency": "6.31",  "ttl": 64},
    {"ip": "192.168.1.1",  "name": "INFRA-NET-FW-01",      "os": "FortiOS 7.2",          "os_full": "FortiGate 7.2.5",         "mac": "AC:22:0B:55:E1:F2", "vendor": "Fortinet",      "latency": "1.18",  "ttl": 255},
    {"ip": "10.0.6.44",    "name": "MAIL-EXCHANGE-01",     "os": "Windows Server 2019",  "os_full": "Windows Server 2019 DC",  "mac": "00:11:22:33:44:55", "vendor": "Dell",          "latency": "3.71",  "ttl": 128},
]

PORTS_MAP = {
    "10.0.1.50":    [("22","tcp","open","ssh","OpenSSH 8.9p1 Ubuntu 3ubuntu0.6"),("80","tcp","open","http","nginx 1.24.0"),("443","tcp","open","ssl/https","nginx 1.24.0 TLS/1.3"),("8080","tcp","open","http-proxy","Apache Tomcat 9.0.74 / OpenJDK 11.0.19"),("8443","tcp","open","ssl/http","Tomcat Manager / log4j-core 2.14.1")],
    "10.0.2.105":   [("22","tcp","open","ssh","OpenSSH 8.2p1 Ubuntu 4ubuntu0.11"),("5432","tcp","open","postgresql","PostgreSQL 14.5-14.8 (DB: prod_financials)"),("6432","tcp","open","pgbouncer","PgBouncer 1.21 connection pool")],
    "10.0.3.200":   [("22","tcp","open","ssh","OpenSSH 7.4p1 RHEL (protocol 2.0)"),("80","tcp","open","http","Apache httpd 2.4.57"),("443","tcp","open","ssl/https","Atlassian Confluence 8.3.0 (TLS/1.2)"),("8090","tcp","open","http","Atlassian Confluence admin portal"),("8091","tcp","open","http","Confluence Synchrony / collaborative editing")],
    "10.0.4.12":    [("22","tcp","open","ssh","OpenSSH 8.4p1"),("80","tcp","open","http","NetScaler 13.1 redirect"),("443","tcp","open","ssl/https","Citrix NetScaler ADC 13.1-49.13"),("4433","tcp","open","ssl/https","Citrix SSL-VPN gateway"),("9443","tcp","open","ssl/https","Citrix management GUI")],
    "172.16.0.5":   [("53","tcp","open","domain","Microsoft DNS 10.0.20348"),("88","tcp","open","kerberos-sec","Microsoft Kerberos"),("135","tcp","open","msrpc","Microsoft Windows RPC"),("139","tcp","open","netbios-ssn","Microsoft netbios-ssn"),("389","tcp","open","ldap","Microsoft AD LDAP (Domain: corp.local)"),("445","tcp","open","microsoft-ds","Windows Server 2022 SMB 3.1.1"),("464","tcp","open","kpasswd5","kpasswd5"),("593","tcp","open","ncacn_http","Microsoft Windows RPC over HTTP 1.0"),("636","tcp","open","ldapssl","Microsoft AD LDAPS"),("3268","tcp","open","globalcatLDAP","Microsoft Windows Active Directory LDAP"),("3269","tcp","open","globalcatLDAPssl","Microsoft AD LDAP SSL"),("3389","tcp","open","ms-wbt-server","Microsoft Terminal Services (RDP)"),("5985","tcp","open","http","Microsoft HTTPAPI httpd 2.0 (WinRM)")],
    "172.16.80.4":  [("502","tcp","open","modbus","Modbus/TCP Industrial Protocol"),("102","tcp","open","iso-tsap","Siemens S7 PLC TSAP"),("20000","tcp","open","dnp3","DNP3 SCADA Protocol"),("44818","tcp","open","EtherNet/IP","Rockwell EtherNet/IP")],
    "10.0.5.88":    [("22","tcp","open","ssh","OpenSSH 8.9p1 Debian"),("3000","tcp","open","http","Node.js Express 4.18.2 / Spring MVC 5.3.12"),("8443","tcp","open","ssl/https","Spring Boot Actuator (heap dump exposed!)")],
    "192.168.20.14":[("22","tcp","open","ssh","OpenSSH 8.2p1 Ubuntu"),("8080","tcp","open","http","Jenkins 2.414.1"),("50000","tcp","open","ibm-db2","Jenkins agent JNLP port")],
    "192.168.1.1":  [("22","tcp","open","ssh","FortiSSH 7.2"),("443","tcp","open","ssl/https","FortiGate HTTPS MGMT / FortiOS 7.2.5"),("541","tcp","open","ssl","FortiGate SSL-VPN")],
    "10.0.6.44":    [("25","tcp","open","smtp","Microsoft ESMTP 15.20.6813.27"),("80","tcp","open","http","Microsoft IIS httpd 10.0"),("110","tcp","open","pop3","Microsoft Exchange POP3"),("143","tcp","open","imap","Microsoft Exchange IMAP4"),("443","tcp","open","ssl/https","Microsoft Exchange OWA 15.2.986.36"),("445","tcp","open","microsoft-ds","Windows Server 2019 SMB"),("587","tcp","open","submission","Microsoft ESMTP"),("993","tcp","open","ssl/imaps","Microsoft Exchange IMAP4 TLS"),("995","tcp","open","ssl/pop3s","Microsoft Exchange POP3 TLS")],
}

SCRIPTS_MAP = {
    "10.0.1.50":    ["|   ssl-cert: Subject: CN=prod-web.corp.local","| ssl-protocols: TLSv1.2, TLSv1.3","| http-server-header: nginx/1.24.0","| http-title: Corporate E-Commerce Platform","| http-robots.txt: 3 disallowed entries","| vulners: cpe:/a:apache:tomcat:9.0.74 (CVE-2023-41080 score: 6.1)","| log4j-scan: VULNERABLE! jndi:ldap injection confirmed on /api/log"],
    "10.0.2.105":   ["|   postgresql-info: 14.8-PostgreSQL", "| postgresql-databases: prod_financials, hr_payroll, audit_log (3 DBs)","| postgresql-users: postgres (superuser), app_rw, readonly"],
    "10.0.3.200":   ["|   http-title: Atlassian Confluence 8.3.0","| ssl-cert: Subject: CN=confluence.corp.internal","| http-auth-finder: No authentication on /setup/setupadministrator.action","| confluence-check: VULNERABLE CVE-2023-22515 — admin creation endpoint exposed"],
    "10.0.4.12":    ["|   ssl-cert: Subject: CN=vpn.corp.com","| http-title: Citrix Gateway 13.1","| citrix-check: Build 13.1-49.13 — VULNERABLE to CVE-2023-4966 (Citrix Bleed)","| ssl-enum-ciphers: TLSv1.2: (ECDHE-RSA-AES256-GCM-SHA384, AES256-SHA256...)"],
    "172.16.0.5":   ["|   smb-security-mode: account_used: guest","| smb2-security-mode: 3.1.1: Message signing enabled but not required","| ldap-rootdse: namingContexts: DC=corp,DC=local","| krb5-enum-users: Valid usernames found: admin, service_acct, backup_svc","| ms-sql-info: NO SQL instances found","| vuln: CVE-2021-34527 PrintSpooler — Print spooler service RUNNING"],
    "172.16.80.4":  ["|   modbus-info: UnitID=1 DeviceID=Siemens-S7-300","| scada-check: Unauthenticated Modbus read/write access confirmed","| dnp3-info: DNP3 outstation detected, no authentication required"],
    "10.0.5.88":    ["|   http-title: Spring Boot Actuator","| spring-actuator: /heapdump endpoint EXPOSED (memory dump without auth)","| spring-check: Spring MVC 5.3.12 — VULNERABLE CVE-2022-22965 (Spring4Shell)"],
    "192.168.20.14":["|   http-title: Jenkins 2.414.1","| jenkins-info: Version 2.414.1 — agent port 50000 open","| jenkins-check: Script console accessible (no CSRF check detected)"],
    "192.168.1.1":  ["|   http-title: FortiGate HTTPS 7.2.5","| ssl-cert: Subject: CN=firewall.corp.local","| fortios-check: FortiOS 7.2.5 — VULNERABLE CVE-2024-21762 SSL-VPN"],
    "10.0.6.44":    ["|   smtp-ntlm-info: Target_Name: CORP NetBIOS_Domain_Name: CORP","| http-auth-finder: Exchange OWA 2019","| exchange-check: CVE-2021-34527 Print Spooler running on Exchange server"],
}

NVT_FAMILIES = [
    "Product Detection", "Service Detection", "General", "Buffer overflow",
    "Web Servers", "Web application abuses", "Databases", "Windows",
    "Gain a shell remotely", "Remote file access", "Useless services",
    "SSL and TLS", "Credentials", "Brute force attacks", "SMTP problems",
    "DNS", "RPC", "FTP", "LDAP", "SMB/CIFS", "Compliance",
]

CVES_FULL = [
    {"cve":"CVE-2023-22515","host":"10.0.3.200","port":"443/tcp","nvt":"1.3.6.1.4.1.25623.1.0.170841","cvss":10.0,"epss":0.974,"vector":"AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H","cwe":"CWE-284","service":"Atlassian Confluence 8.3.0","detail":"Broken access control — unauthenticated admin account creation"},
    {"cve":"CVE-2021-44228","host":"10.0.1.50", "port":"8080/tcp","nvt":"1.3.6.1.4.1.25623.1.0.147021","cvss":10.0,"epss":0.976,"vector":"AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H","cwe":"CWE-917","service":"Apache Log4j-core 2.14.1","detail":"JNDI injection → Remote Code Execution via ${jndi:ldap://...}"},
    {"cve":"CVE-2024-3094", "host":"172.16.0.5","port":"22/tcp", "nvt":"1.3.6.1.4.1.25623.1.0.147500","cvss":10.0,"epss":0.944,"vector":"AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H","cwe":"CWE-506","service":"OpenSSH / XZ Utils 5.6.1 liblzma","detail":"Supply chain backdoor — SSH RCE via malicious liblzma"},
    {"cve":"CVE-2024-21762","host":"192.168.1.1","port":"541/tcp","nvt":"1.3.6.1.4.1.25623.1.0.170922","cvss":9.6,"epss":0.912,"vector":"AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H","cwe":"CWE-787","service":"FortiOS 7.2.5 SSL-VPN","detail":"Out-of-bounds write → unauthenticated RCE in SSL-VPN handler"},
    {"cve":"CVE-2023-4966", "host":"10.0.4.12", "port":"443/tcp","nvt":"1.3.6.1.4.1.25623.1.0.170812","cvss":9.4,"epss":0.961,"vector":"AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H","cwe":"CWE-119","service":"Citrix NetScaler ADC 13.1-49.13","detail":"Buffer overflow → session token leak (Citrix Bleed)"},
    {"cve":"CVE-2022-22965","host":"10.0.5.88", "port":"3000/tcp","nvt":"1.3.6.1.4.1.25623.1.0.146800","cvss":9.8,"epss":0.714,"vector":"AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H","cwe":"CWE-94","service":"Spring MVC 5.3.12 / Tomcat","detail":"DataBinder classloader manipulation → JSP webshell upload"},
    {"cve":"CVE-2023-38606","host":"10.0.3.200","port":"8090/tcp","nvt":"1.3.6.1.4.1.25623.1.0.170845","cvss":9.8,"epss":0.763,"vector":"AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H","cwe":"CWE-787","service":"Kernel MMIO subsystem","detail":"Kernel memory corruption via MMIO hardware register write"},
    {"cve":"CVE-2021-34527","host":"172.16.0.5","port":"135/tcp","nvt":"1.3.6.1.4.1.25623.1.0.100054","cvss":8.8,"epss":0.881,"vector":"AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H","cwe":"CWE-269","service":"Windows Print Spooler Service","detail":"PrintNightmare — print spooler RCE / LPE to SYSTEM"},
    {"cve":"CVE-2023-4863", "host":"10.0.1.50", "port":"80/tcp", "nvt":"1.3.6.1.4.1.25623.1.0.147600","cvss":8.8,"epss":0.822,"vector":"AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H","cwe":"CWE-122","service":"libwebp 1.2.4 / nginx image pipeline","detail":"Heap buffer overflow via crafted WebP image"},
    {"cve":"CVE-2024-1709", "host":"10.0.6.44", "port":"443/tcp","nvt":"1.3.6.1.4.1.25623.1.0.170950","cvss":10.0,"epss":0.933,"vector":"AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H","cwe":"CWE-288","service":"ConnectWise ScreenConnect < 23.9.8","detail":"Authentication bypass → ransomware deployment (LockBit, Bl00dy)"},
    {"cve":"CVE-2021-34527","host":"10.0.6.44", "port":"445/tcp","nvt":"1.3.6.1.4.1.25623.1.0.100071","cvss":8.8,"epss":0.881,"vector":"AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H","cwe":"CWE-269","service":"Windows Print Spooler / Exchange","detail":"PrintNightmare — Exchange server print spooler LPE"},
    {"cve":"CVE-2023-22515","host":"10.0.1.50", "port":"8443/tcp","nvt":"1.3.6.1.4.1.25623.1.0.170843","cvss":10.0,"epss":0.974,"vector":"AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H","cwe":"CWE-284","service":"Confluence secondary endpoint","detail":"Broken access control on secondary Tomcat instance"},
    {"cve":"CVE-2024-3094", "host":"10.0.2.105","port":"22/tcp", "nvt":"1.3.6.1.4.1.25623.1.0.147502","cvss":10.0,"epss":0.944,"vector":"AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H","cwe":"CWE-506","service":"OpenSSH / XZ Utils liblzma 5.6.0","detail":"XZ backdoor — liblzma linked in sshd (systemd)"},
    {"cve":"CVE-2022-22965","host":"192.168.20.14","port":"8080/tcp","nvt":"1.3.6.1.4.1.25623.1.0.146802","cvss":9.8,"epss":0.714,"vector":"AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H","cwe":"CWE-94","service":"Jenkins 2.414.1 / Spring","detail":"Spring4Shell via Jenkins Spring-based plugin"},
]

EPSS_COMMENTS = {
    0.97: "Top 1% most exploited — actively weaponized in the wild",
    0.94: "Top 2% most exploited — nation-state level activity observed",
    0.91: "Top 3% most exploited — mass scanning and PoC exploitation active",
    0.88: "Top 4% most exploited — ransomware groups actively using",
    0.82: "Top 6% most exploited — multiple threat actor groups exploiting",
    0.76: "Top 7% most exploited — targeted attacks confirmed",
    0.71: "Top 9% most exploited — exploitation seen in controlled campaigns",
}


def build_deep_scan_logs(target: str, depth: str) -> list:
    """Generate ~2000 realistic log lines across 6 pipeline stages."""
    logs = []
    rng = random.Random(42)  # deterministic for reproducibility

    def ts():
        return _time.strftime("%H:%M:%S")

    def L(level: str, stage: int, msg: str):
        logs.append({"timestamp": ts(), "level": level, "stage": stage, "msg": msg})

    def blank(stage=0):
        logs.append({"timestamp": ts(), "level": "INFO", "stage": stage, "msg": ""})

    # ════════════════════════════════════════
    # STAGE 0 — INITIALIZATION
    # ════════════════════════════════════════
    L("INIT", 0, "╔══════════════════════════════════════════════════════════════════════╗")
    L("INIT", 0, "║        CyberShield AI — Automated Security Assessment Pipeline       ║")
    L("INIT", 0, "║  Nmap 7.94  |  OpenVAS GVM 22.4  |  NVD API v2.0  |  FIRST.org EPSS ║")
    L("INIT", 0, f"║  Target  : {target:<20}  Profile : {depth:<24}║")
    L("INIT", 0, f"║  Started : {_time.strftime('%Y-%m-%d %H:%M:%S'):<55}║")
    L("INIT", 0, "╚══════════════════════════════════════════════════════════════════════╝")
    blank(0)
    L("INFO", 0, "[*] Initializing CyberShield AI pipeline v1.0 ...")
    L("INFO", 0, "[*] Loading asset criticality context from SQLite inventory DB ...")
    L("INFO", 0, f"[*] Found {len(HOSTS)} registered assets with criticality / exposure metadata")
    L("INFO", 0, "[*] Criticality weights loaded: Mission Critical=1.50 | High=1.25 | Medium=1.00 | Low=0.75")
    L("INFO", 0, "[*] Exposure weights loaded   : Internet Facing=1.40 | DMZ=1.20 | Internal=1.00 | Air-Gap=0.60")
    L("INFO", 0, "[*] EPSS enrichment endpoint  : https://api.first.org/data/1.0/epss")
    L("INFO", 0, "[*] NVD API endpoint          : https://services.nvd.nist.gov/rest/json/cves/2.0")
    L("INFO", 0, "[*] OpenVAS GVM socket        : /var/run/gvmd/gvmd.sock")
    L("INFO", 0, "[*] AI risk engine parameters : α=0.80 | MAX_THEORETICAL=49.14 | NORM_CONST=45.0")
    blank(0)
    L("INFO", 0, "[*] Verifying tool availability ...")
    L("INFO", 0, "[✓] nmap 7.94 — found at /usr/bin/nmap")
    L("INFO", 0, "[✓] openvas-scanner 22.7.9 — found at /usr/sbin/openvas")
    L("INFO", 0, "[✓] gvmd 22.9.1 — socket responding at /var/run/gvmd/gvmd.sock")
    L("INFO", 0, "[✓] Python 3.11.4 — gvm-tools 24.0.0 loaded")
    L("INFO", 0, "[✓] curl 8.4.0 — NVD/EPSS API connectivity verified (HTTP 200)")
    L("INFO", 0, f"[*] Scan scope: {target} — estimated {rng.randint(250,255)} addresses in range")
    L("INFO", 0, f"[*] Scan depth profile: {depth}")
    L("INFO", 0, "[*] Packet rate: 2000 packets/sec | Max RTT: 300ms | Parallelism: 512")
    blank(0)

    # ════════════════════════════════════════
    # STAGE 1 — NMAP HOST DISCOVERY (ARP/ICMP ping sweep)
    # ════════════════════════════════════════
    L("NMAP", 1, "")
    L("NMAP", 1, "═══════════════════════════════════════════════════════════════════════")
    L("NMAP", 1, "  STAGE 1 — Nmap Host Discovery (ARP Ping Sweep + ICMP Echo)")
    L("NMAP", 1, "═══════════════════════════════════════════════════════════════════════")
    L("NMAP", 1, f"$ nmap -sn -PE -PP -PS80,443,22,3389,8080 -PA80,443 --send-ip -T4 --min-rate 2000 {target}")
    L("NMAP", 1, f"Starting Nmap 7.94 ( https://nmap.org ) at {_time.strftime('%Y-%m-%d %H:%M')} UTC")
    L("NMAP", 1, f"Initiating ARP Ping Scan at {ts()}")
    L("NMAP", 1, f"Scanning {rng.randint(250,255)} hosts  [{rng.randint(3,5)} ports]")
    blank(1)

    # Simulate the full /24 sweep — dead hosts
    dead_ips = [f"10.0.0.{i}" for i in [1,2,3,4,5,6,8,9,10,12,15,20,25,30,40,51,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,251,252,253,254]]
    for ip in dead_ips[:20]:
        L("NMAP", 1, f"Scanned {ip}  — no response (host down or filtered)")

    blank(1)
    L("NMAP", 1, "Discovered live hosts from ARP sweep:")
    blank(1)

    for h in HOSTS:
        L("NMAP", 1, f"Nmap scan report for {h['ip']}")
        L("NMAP", 1, f"Host is up ({h['latency']}ms latency).")
        L("NMAP", 1, f"MAC Address: {h['mac']} ({h['vendor']})")
        L("NMAP", 1, f"Resolved hostname: {h['name']}.corp.local")
        blank(1)

    L("NMAP", 1, f"Completed ARP Ping Scan at {ts()}, scanned {rng.randint(250,255)} hosts (10 live) in {rng.uniform(3.2,5.8):.2f} seconds")
    L("NMAP", 1, f"Raw packets sent: {rng.randint(480,530)} ({rng.randint(20000,25000)}B) | Rcvd: {rng.randint(10,12)} ({rng.randint(400,700)}B)")
    blank(1)

    # ════════════════════════════════════════
    # STAGE 2 — NMAP PORT + SERVICE + OS + SCRIPTS
    # ════════════════════════════════════════
    L("NMAP", 2, "")
    L("NMAP", 2, "═══════════════════════════════════════════════════════════════════════")
    L("NMAP", 2, "  STAGE 2 — SYN Stealth Port Scan + Version Detection + OS Fingerprint + NSE Scripts")
    L("NMAP", 2, "═══════════════════════════════════════════════════════════════════════")
    L("NMAP", 2, f"$ nmap -sS -sV -sC -O -A --script=vuln,auth,default,discovery,safe -p 1-65535 --open -T4")
    L("NMAP", 2, f"       --min-rate 1500 --max-retries 2 --host-timeout 600s -oA /tmp/cybershield_scan {target}")
    L("NMAP", 2, f"Starting Nmap 7.94 ( https://nmap.org ) at {_time.strftime('%Y-%m-%d %H:%M')} UTC")
    L("NMAP", 2, f"NSE: Loaded {rng.randint(152,160)} scripts for scanning (vuln, auth, discovery, default, safe).")
    L("NMAP", 2, "NSE: Script Pre-scanning ...")
    L("NMAP", 2, "Initiating SYN Stealth Scan ...")
    L("NMAP", 2, f"Scanning 10 hosts  [65535 ports/host = 655,350 total port checks]")
    blank(2)

    total_open = 0
    for h in HOSTS:
        ports = PORTS_MAP.get(h["ip"], [])
        scripts = SCRIPTS_MAP.get(h["ip"], [])
        total_open += len(ports)
        closed_est = rng.randint(65510, 65530) - len(ports)
        filtered_est = rng.randint(0, 3)

        blank(2)
        L("NMAP", 2, f"─────────────────────────────────────────────────────────────────")
        L("NMAP", 2, f"Nmap scan report for {h['ip']} ({h['name']}.corp.local)")
        L("NMAP", 2, f"Host is up ({h['latency']}ms latency). TTL={h['ttl']}")
        L("NMAP", 2, f"Not shown: {closed_est} closed tcp ports (reset), {filtered_est} filtered ports (no-response)")
        L("NMAP", 2, f"")
        L("NMAP", 2, f"PORT       STATE  SERVICE         VERSION")
        for port, proto, state, svc, version in ports:
            col_pad = max(0, 10 - len(f"{port}/{proto}"))
            L("NMAP", 2, f"{port}/{proto}{' '*col_pad}{state}  {svc:<15} {version}")
        blank(2)
        L("NMAP", 2, "Host script results:")
        for script_line in scripts:
            L("NMAP", 2, script_line)
        blank(2)

        # OS fingerprint
        conf = rng.randint(88, 99)
        L("NMAP", 2, "OS detection performed. Please report any incorrect results at https://nmap.org/submit/ .")
        L("NMAP", 2, f"OS fingerprint: {h['os_full']} — Confidence: {conf}%  (TTL={h['ttl']})")
        L("NMAP", 2, f"Network Distance: {rng.randint(1,4)} hops")
        L("NMAP", 2, f"Service Info: Host: {h['name']}; OS: {h['os']}; CPE: cpe:/o:canonical:ubuntu_linux:22.04")
        blank(2)

    L("NMAP", 2, "═══════════════════════════════════════════════════════════════════════")
    L("NMAP", 2, f"Nmap done: {len(HOSTS)} IP addresses ({len(HOSTS)} hosts up) scanned in {rng.uniform(240,270):.2f} seconds")
    L("NMAP", 2, f"Raw packets sent: {rng.randint(1300000,1400000):,}  ({rng.randint(60,80)}MB) | Rcvd: {rng.randint(80000,100000):,}  ({rng.randint(5,8)}MB)")
    L("NMAP", 2, f"Total open ports discovered: {total_open}  across {len(HOSTS)} live hosts")
    L("NMAP", 2, f"NSE: Script Post-scanning ... Done.")
    blank(2)

    # ════════════════════════════════════════
    # STAGE 3 — OPENVAS GVM AUTHENTICATED SCAN
    # ════════════════════════════════════════
    L("OPENVAS", 3, "")
    L("OPENVAS", 3, "═══════════════════════════════════════════════════════════════════════")
    L("OPENVAS", 3, "  STAGE 3 — OpenVAS GVM 22.4 — Authenticated Vulnerability Assessment")
    L("OPENVAS", 3, "═══════════════════════════════════════════════════════════════════════")
    L("OPENVAS", 3, "[GVM] Connecting to /var/run/gvmd/gvmd.sock ...")
    L("OPENVAS", 3, "[GVM] Authentication: OK (admin / cybershield-platform) — session token: 9f3a2c1b4d8e")
    L("OPENVAS", 3, "[GVM] GVM version: 22.4.1 | gvmd: 22.9.1 | openvas-scanner: 22.7.9")
    L("OPENVAS", 3, f"[GVM] Greenbone Community Feed (GCF) version: 20240805T0613")
    L("OPENVAS", 3, f"[GVM] NVT database: 87,453 scripts | CPE database: 421,839 entries | CVE database: 228,467 entries")
    L("OPENVAS", 3, f"[GVM] CERT feed: BSI CERT-Bund {rng.randint(3400,3600)} advisories | DFN-CERT {rng.randint(7000,8000)} advisories")
    blank(3)
    L("OPENVAS", 3, f"[GVM] Creating scan target: {len(HOSTS)} hosts from Nmap discovery results")
    L("OPENVAS", 3, f"[GVM] Scan config: Full and Fast (OID: daba56c8-73ec-11df-a475-002264764cea)")
    L("OPENVAS", 3, f"[GVM] Scan task created: ID = a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    L("OPENVAS", 3, f"[GVM] Port list: All IANA Assigned TCP and UDP (extended)")
    L("OPENVAS", 3, f"[GVM] Credentials: SSH (key), SMB (admin), SNMP v3 configured")
    blank(3)

    # NVT family execution
    for family in NVT_FAMILIES:
        nvt_count_f = rng.randint(200, 6000)
        L("OPENVAS", 3, f"[GVM] Executing NVT family: {family:<35} ({nvt_count_f:,} scripts)")

    blank(3)
    L("OPENVAS", 3, f"[GVM] Phase 1: Product / Service Detection NVTs running across {len(HOSTS)} hosts ...")
    blank(3)

    # Per-host OpenVAS scan output
    for h in HOSTS:
        L("OPENVAS", 3, f"[GVM] Scanning host: {h['ip']} ({h['name']}) ...")
        ports = PORTS_MAP.get(h["ip"], [])
        for port, proto, state, svc, version in ports:
            nvts_on_port = rng.randint(8, 45)
            L("OPENVAS", 3, f"  [{h['ip']}:{port}/{proto}] Executing {nvts_on_port} NVTs — service={svc}")
            if rng.random() > 0.6:
                L("OPENVAS", 3, f"  [{h['ip']}:{port}/{proto}] Service fingerprinted: {version}")
            if rng.random() > 0.7:
                l = f"  [{h['ip']}:{port}/{proto}] CPE matched: cpe:/a:{svc.split()[0].lower()}:{svc.split()[0].lower()}"
                L("OPENVAS", 3, l)
        blank(3)

    # NVT results — all 14 CVEs
    L("OPENVAS", 3, "")
    L("OPENVAS", 3, "─────────────────────────────────────────────────────────────────────")
    L("OPENVAS", 3, "  VULNERABILITY MATCH RESULTS — OpenVAS GVM 22.4")
    L("OPENVAS", 3, "─────────────────────────────────────────────────────────────────────")
    blank(3)

    for i, cve in enumerate(CVES_FULL):
        severity = "CRITICAL" if cve["cvss"] >= 9 else "HIGH" if cve["cvss"] >= 7 else "MEDIUM"
        L("OPENVAS", 3, f"[FINDING #{i+1:02d}] {severity} — Host: {cve['host']} | Port: {cve['port']}")
        L("OPENVAS", 3, f"  NVT      : {cve['nvt']}")
        L("OPENVAS", 3, f"  CVE ID   : {cve['cve']}")
        L("OPENVAS", 3, f"  CVSS 3.1 : {cve['cvss']} ({severity})")
        L("OPENVAS", 3, f"  Vector   : {cve['vector']}")
        L("OPENVAS", 3, f"  CWE      : {cve['cwe']}")
        L("OPENVAS", 3, f"  Service  : {cve['service']}")
        L("OPENVAS", 3, f"  Detail   : {cve['detail']}")
        blank(3)

    L("OPENVAS", 3, "─────────────────────────────────────────────────────────────────────")
    L("OPENVAS", 3, f"[GVM] Scan complete. Task ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890")
    L("OPENVAS", 3, f"[GVM] Total NVT checks executed : 87,453 scripts × {len(HOSTS)} hosts")
    L("OPENVAS", 3, f"[GVM] Findings summary         : {len(CVES_FULL)} vulnerabilities ({len([c for c in CVES_FULL if c['cvss']>=9])} CRITICAL | {len([c for c in CVES_FULL if 7<=c['cvss']<9])} HIGH)")
    L("OPENVAS", 3, f"[GVM] Scan duration            : {rng.randint(12,18)}m {rng.randint(10,59)}s")
    L("OPENVAS", 3, f"[GVM] Report generated         : /var/lib/openvas/reports/cybershield_scan_{_time.strftime('%Y%m%d')}.xml")
    blank(3)

    # ════════════════════════════════════════
    # STAGE 4 — NIST NVD + EPSS ENRICHMENT
    # ════════════════════════════════════════
    L("CVE_FEED", 4, "")
    L("CVE_FEED", 4, "═══════════════════════════════════════════════════════════════════════")
    L("CVE_FEED", 4, "  STAGE 4 — NIST NVD API v2.0 + FIRST.org EPSS Enrichment")
    L("CVE_FEED", 4, "═══════════════════════════════════════════════════════════════════════")
    L("CVE_FEED", 4, f"[NVD] Initializing NIST NVD API v2.0 client ...")
    L("CVE_FEED", 4, f"[NVD] Base URL: https://services.nvd.nist.gov/rest/json/cves/2.0")
    L("CVE_FEED", 4, f"[NVD] Rate limit: 50 requests/30s (with API key)")
    L("CVE_FEED", 4, f"[EPSS] Base URL: https://api.first.org/data/1.0/epss")
    blank(4)

    unique_cves = list(dict.fromkeys([c["cve"] for c in CVES_FULL]))
    for cve_id in unique_cves:
        matching = [c for c in CVES_FULL if c["cve"] == cve_id][0]
        L("CVE_FEED", 4, f"[NVD] GET /cves/2.0?cveId={cve_id}")
        L("CVE_FEED", 4, f"[NVD] HTTP 200 OK  ({rng.randint(180,350)}ms)")
        L("CVE_FEED", 4, f"[NVD] {cve_id}: CVSS={matching['cvss']} | Vector={matching['vector']}")
        L("CVE_FEED", 4, f"[NVD] {cve_id}: CWE={matching['cwe']}")
        L("CVE_FEED", 4, f"[NVD] {cve_id}: References: {rng.randint(3,12)} vendor advisories, {rng.randint(1,4)} exploit DBs")
        blank(4)

    blank(4)
    L("CVE_FEED", 4, f"[EPSS] Batch request for {len(unique_cves)} CVEs ...")
    L("CVE_FEED", 4, f"[EPSS] GET /data/1.0/epss?cve={','.join(unique_cves)}")
    L("CVE_FEED", 4, f"[EPSS] HTTP 200 OK  ({rng.randint(400,800)}ms)")
    blank(4)
    for cve in CVES_FULL:
        epss_pct = cve["epss"] * 100
        pct_rank = 100 - int(epss_pct)
        comment = next((v for k, v in EPSS_COMMENTS.items() if abs(epss_pct/100 - k) < 0.03), "Active exploitation observed")
        L("CVE_FEED", 4, f"[EPSS] {cve['cve']:<18} → {cve['epss']:.4f}  ({epss_pct:.2f}%  Top {pct_rank}%)  — {comment}")
    blank(4)

    # Exploit check
    L("CVE_FEED", 4, "[EXPLOIT] Checking ExploitDB / Metasploit Framework / GitHub PoC databases ...")
    for cve in CVES_FULL:
        L("CVE_FEED", 4, f"[EXPLOIT] {cve['cve']:<18} → Weaponized PoC confirmed  | MSF module available  | GitHub PoCs: {rng.randint(2,18)}")
    blank(4)
    L("CVE_FEED", 4, "[CISA] Checking CISA KEV (Known Exploited Vulnerabilities) catalog ...")
    for cve in CVES_FULL[:8]:
        L("CVE_FEED", 4, f"[CISA] {cve['cve']:<18} → IN KEV CATALOG — Due date: {rng.choice(['2023-11-03','2024-03-01','2024-02-15','2023-10-23','2024-01-17'])}")
    blank(4)

    # ════════════════════════════════════════
    # STAGE 5 — AI RISK ENGINE
    # ════════════════════════════════════════
    L("AI_ENGINE", 5, "")
    L("AI_ENGINE", 5, "═══════════════════════════════════════════════════════════════════════")
    L("AI_ENGINE", 5, "  STAGE 5 — CyberShield AI Risk Engine — Multi-Factor Scoring & XAI")
    L("AI_ENGINE", 5, "═══════════════════════════════════════════════════════════════════════")
    L("AI_ENGINE", 5, "[AI] CyberShield AI Risk Engine v1.0 initialized")
    L("AI_ENGINE", 5, "[AI] Formula: Risk = CVSS × W_crit × (1 + α·EPSS) × W_exp × M_exploit → [0,100]")
    L("AI_ENGINE", 5, "[AI] Parameters:")
    L("AI_ENGINE", 5, "[AI]   α (EPSS amplification)      = 0.800")
    L("AI_ENGINE", 5, "[AI]   W_crit (Mission Critical)   = 1.500")
    L("AI_ENGINE", 5, "[AI]   W_crit (High)               = 1.250")
    L("AI_ENGINE", 5, "[AI]   W_crit (Medium)             = 1.000")
    L("AI_ENGINE", 5, "[AI]   W_crit (Low)                = 0.750")
    L("AI_ENGINE", 5, "[AI]   W_exp  (Internet Facing)    = 1.400")
    L("AI_ENGINE", 5, "[AI]   W_exp  (DMZ)                = 1.200")
    L("AI_ENGINE", 5, "[AI]   W_exp  (Internal Subnet)    = 1.000")
    L("AI_ENGINE", 5, "[AI]   W_exp  (Isolated/Air-Gap)   = 0.600")
    L("AI_ENGINE", 5, "[AI]   M_exploit (PoC confirmed)   = 1.300")
    L("AI_ENGINE", 5, "[AI]   M_exploit (no exploit)      = 1.000")
    L("AI_ENGINE", 5, "[AI]   MAX_THEORETICAL             = 49.14")
    L("AI_ENGINE", 5, "[AI]   NORMALIZATION_CONSTANT      = 45.00")
    blank(5)

    asset_crit_map = {
        "10.0.1.50":"Mission Critical","10.0.2.105":"Mission Critical","10.0.3.200":"High",
        "10.0.4.12":"Mission Critical","172.16.0.5":"Mission Critical","172.16.80.4":"High",
        "10.0.5.88":"Medium","192.168.20.14":"Medium","192.168.1.1":"Mission Critical","10.0.6.44":"High"
    }
    asset_exp_map = {
        "10.0.1.50":"Internet Facing","10.0.2.105":"Internal Subnet","10.0.3.200":"Internet Facing",
        "10.0.4.12":"Internet Facing","172.16.0.5":"Internal Subnet","172.16.80.4":"DMZ",
        "10.0.5.88":"DMZ","192.168.20.14":"Internal Subnet","192.168.1.1":"Internet Facing","10.0.6.44":"Internet Facing"
    }
    wcrit_map = {"Mission Critical":1.50,"High":1.25,"Medium":1.00,"Low":0.75}
    wexp_map  = {"Internet Facing":1.40,"DMZ":1.20,"Internal Subnet":1.00,"Isolated / Air-Gapped":0.60}

    for i, cve in enumerate(CVES_FULL):
        crit = asset_crit_map.get(cve["host"], "High")
        exp  = asset_exp_map.get(cve["host"], "Internal Subnet")
        wc   = wcrit_map[crit]
        we   = wexp_map[exp]
        epss = cve["epss"]
        ef   = round(1 + 0.8 * epss, 4)
        raw  = round(cve["cvss"] * wc * ef * we * 1.3, 4)
        score= round(min(100, raw / 45 * 100), 1)
        tier = "CRITICAL" if score >= 80 else "HIGH" if score >= 60 else "MEDIUM"
        L("AI_ENGINE", 5, f"[AI] ── Finding #{i+1:02d}: {cve['cve']} on {cve['host']} ──")
        L("AI_ENGINE", 5, f"[AI]   Step 1  CVSS Base Score          = {cve['cvss']}")
        L("AI_ENGINE", 5, f"[AI]   Step 2  Asset Criticality        = {crit}  →  W_crit = {wc}")
        L("AI_ENGINE", 5, f"[AI]   Step 3  EPSS Score               = {epss:.4f}  ({epss*100:.2f}%)")
        L("AI_ENGINE", 5, f"[AI]   Step 4  EPSS Factor (1+α·EPSS)   = 1 + 0.8 × {epss:.4f} = {ef}")
        L("AI_ENGINE", 5, f"[AI]   Step 5  Network Exposure         = {exp}  →  W_exp = {we}")
        L("AI_ENGINE", 5, f"[AI]   Step 6  Exploit Multiplier       = ×1.30  (weaponized PoC confirmed)")
        L("AI_ENGINE", 5, f"[AI]   Step 7  Raw Risk                 = {cve['cvss']} × {wc} × {ef} × {we} × 1.30 = {raw}")
        L("AI_ENGINE", 5, f"[AI]   Step 8  Normalized Score         = ({raw} ÷ 45.00) × 100 = {score}")
        L("AI_ENGINE", 5, f"[AI]   Result  AI Risk Score            = {score}/100  [{tier}]")
        # SHAP
        base_l   = round(cve["cvss"]*3.5, 2)
        epss_l   = round(epss*100*0.25, 2)
        crit_l   = round((wc-0.75)/0.75*20, 2)
        exp_l    = round((we-0.6)/0.8*20, 2)
        expl_l   = 15.0
        tot      = max(base_l+epss_l+crit_l+exp_l+expl_l, 0.01)
        L("AI_ENGINE", 5, f"[AI]   SHAP   CVSS Base Severity        = {base_l} ({round(base_l/tot*100,1)}%)")
        L("AI_ENGINE", 5, f"[AI]   SHAP   EPSS Exploit Probability  = {epss_l} ({round(epss_l/tot*100,1)}%)")
        L("AI_ENGINE", 5, f"[AI]   SHAP   Asset Business Criticality= {crit_l} ({round(crit_l/tot*100,1)}%)")
        L("AI_ENGINE", 5, f"[AI]   SHAP   Network Exposure Zone     = {exp_l} ({round(exp_l/tot*100,1)}%)")
        L("AI_ENGINE", 5, f"[AI]   SHAP   Weaponized Exploit        = {expl_l} ({round(expl_l/tot*100,1)}%)")
        blank(5)

    scores = []
    for cve in CVES_FULL:
        crit=asset_crit_map.get(cve["host"],"High"); exp=asset_exp_map.get(cve["host"],"Internal Subnet")
        wc=wcrit_map[crit]; we=wexp_map[exp]; ef=1+0.8*cve["epss"]
        raw=cve["cvss"]*wc*ef*we*1.3; sc=round(min(100,raw/45*100),1)
        scores.append(sc)
    avg = round(sum(scores)/len(scores), 1)
    crits = sum(1 for s in scores if s >= 80)

    L("AI_ENGINE", 5, f"[AI] ═══════════════ RISK ENGINE SUMMARY ═══════════════")
    L("AI_ENGINE", 5, f"[AI] Total findings processed       : {len(CVES_FULL)}")
    L("AI_ENGINE", 5, f"[AI] CRITICAL (score ≥ 80)          : {crits}")
    L("AI_ENGINE", 5, f"[AI] HIGH     (score 60-79)         : {sum(1 for s in scores if 60<=s<80)}")
    L("AI_ENGINE", 5, f"[AI] MEDIUM   (score 40-59)         : {sum(1 for s in scores if 40<=s<60)}")
    L("AI_ENGINE", 5, f"[AI] LOW      (score  0-39)         : {sum(1 for s in scores if s<40)}")
    L("AI_ENGINE", 5, f"[AI] Average system risk index      : {avg}/100")
    L("AI_ENGINE", 5, f"[AI] Top priority CVE               : {max(CVES_FULL, key=lambda c: c['epss'])['cve']}  (score 100.0/100)")
    L("AI_ENGINE", 5, f"[AI] SHAP attribution computed      : All {len(CVES_FULL)} findings explained")
    L("AI_ENGINE", 5, f"[AI] XAI narratives generated       : {len(CVES_FULL)} natural language reports")
    blank(5)

    # ════════════════════════════════════════
    # STAGE 6 — COMPLETE
    # ════════════════════════════════════════
    L("SUCCESS", 6, "")
    L("SUCCESS", 6, "═══════════════════════════════════════════════════════════════════════")
    L("SUCCESS", 6, "  STAGE 6 — Pipeline Complete — All Results Persisted")
    L("SUCCESS", 6, "═══════════════════════════════════════════════════════════════════════")
    L("SUCCESS", 6, f"[✓] Nmap host discovery      : {len(HOSTS)} live hosts / {rng.randint(250,255)} addresses scanned")
    L("SUCCESS", 6, f"[✓] Nmap port scan           : {total_open} open ports found across {len(HOSTS)} hosts")
    L("SUCCESS", 6, f"[✓] Nmap OS fingerprint      : {len(HOSTS)}/{len(HOSTS)} hosts fingerprinted (avg confidence {rng.randint(92,97)}%)")
    L("SUCCESS", 6, f"[✓] Nmap NSE scripts         : {rng.randint(150,162)} scripts executed | vuln, auth, discovery, safe")
    L("SUCCESS", 6, f"[✓] OpenVAS NVT checks       : 87,453 scripts × {len(HOSTS)} hosts = ~874,530 total checks")
    L("SUCCESS", 6, f"[✓] OpenVAS findings         : {len(CVES_FULL)} vulnerabilities across {len(set(c['host'] for c in CVES_FULL))} hosts")
    L("SUCCESS", 6, f"[✓] NVD API queries          : {len(unique_cves)} CVEs enriched with CWE / reference data")
    L("SUCCESS", 6, f"[✓] EPSS scores              : {len(CVES_FULL)} CVEs scored via FIRST.org API")
    L("SUCCESS", 6, f"[✓] CISA KEV check           : {len([c for c in CVES_FULL[:8]])} CVEs confirmed in KEV catalog")
    L("SUCCESS", 6, f"[✓] AI risk scoring          : {len(CVES_FULL)} findings scored | avg risk = {avg}/100")
    L("SUCCESS", 6, f"[✓] SHAP XAI attribution     : All {len(CVES_FULL)} findings decomposed (5 features each)")
    L("SUCCESS", 6, f"[✓] Database persisted       : Findings committed to SQLite / findings table")
    L("SUCCESS", 6, f"[✓] Dashboard refreshed      : Stats, charts, top threats updated")
    L("SUCCESS", 6, f"[✓] IEEE report ready        : Executive summary + full risk matrix generated")
    blank(6)
    L("SUCCESS", 6, f"[*] Total log lines generated : {len(logs)+5}")
    L("SUCCESS", 6, f"[*] Pipeline duration         : {rng.randint(3,5)}m {rng.randint(10,59)}s")
    L("SUCCESS", 6, f"[*] CyberShield AI scan complete. All systems updated.")
    L("SUCCESS", 6, "═══════════════════════════════════════════════════════════════════════")

    return logs
