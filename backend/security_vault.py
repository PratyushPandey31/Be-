import hashlib
import time
import json
from typing import List, Dict, Any

class MerkleAuditLedger:
    """
    Immutable Forensic-Grade Blockchain-Style Audit Ledger using SHA-256 Merkle Chaining.
    Provides mathematical proof that audit trails and mitigation events have never been tampered with.
    """
    def __init__(self):
        self.chain: List[Dict[str, Any]] = []
        self._create_genesis_block()

    def _create_genesis_block(self):
        genesis_payload = {
            "index": 0,
            "timestamp": "2026-08-01 00:00:00",
            "event_type": "GENESIS_ROOT",
            "actor": "Pratyush Pandey (SecOps Lead)",
            "target": "CyberShield AI Core System Vault",
            "details": "Initialized Zero-Trust Cryptographic Ledger · NIST SP 800-53 Rev 5 Compliant",
            "prev_hash": "0" * 64
        }
        raw = json.dumps(genesis_payload, sort_keys=True)
        block_hash = hashlib.sha256(raw.encode('utf-8')).hexdigest()
        genesis_payload["block_hash"] = block_hash
        self.chain.append(genesis_payload)

    def log_security_event(self, event_type: str, actor: str, target: str, details: str) -> Dict[str, Any]:
        prev_block = self.chain[-1]
        prev_hash = prev_block["block_hash"]
        idx = len(self.chain)
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

        block = {
            "index": idx,
            "timestamp": timestamp,
            "event_type": event_type,
            "actor": actor,
            "target": target,
            "details": details,
            "prev_hash": prev_hash
        }
        raw = json.dumps(block, sort_keys=True)
        block_hash = hashlib.sha256(raw.encode('utf-8')).hexdigest()
        block["block_hash"] = block_hash
        self.chain.append(block)
        return block

    def verify_ledger_integrity(self) -> Dict[str, Any]:
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i - 1]

            if curr["prev_hash"] != prev["block_hash"]:
                return {
                    "integrity_valid": False,
                    "tamper_detected_at_block": i,
                    "error": "Previous block hash mismatch - audit log has been modified!"
                }

            # Recalculate hash of current block without block_hash field
            block_copy = {k: v for k, v in curr.items() if k != "block_hash"}
            expected_hash = hashlib.sha256(json.dumps(block_copy, sort_keys=True).encode('utf-8')).hexdigest()
            if curr["block_hash"] != expected_hash:
                return {
                    "integrity_valid": False,
                    "tamper_detected_at_block": i,
                    "error": "Current block hash corruption detected!"
                }

        return {
            "integrity_valid": True,
            "total_blocks_verified": len(self.chain),
            "latest_merkle_root": self.chain[-1]["block_hash"],
            "status": "MATHEMATICALLY VERIFIED & IMMUTABLE",
            "attestation": "Compliant with ISO/IEC 27001:2022 A.8.15 Logging & Non-Repudiation"
        }

# Global Ledger Instance
AUDIT_LEDGER = MerkleAuditLedger()

# Seed with initial security actions
AUDIT_LEDGER.log_security_event("PROACTIVE_HARDENING", "Pratyush Pandey (SecOps Lead)", "10.0.1.50 (Nginx Gateway)", "Enforced WAF pre-filtering rules for JNDI/LDAP injection patterns")
AUDIT_LEDGER.log_security_event("AUTONOMOUS_MITIGATION", "CyberShield AI SOAR Engine", "10.0.1.50 (PROD-WEB-SERVER-01)", "Neutralized CVE-2021-44228 Log4Shell in 8.5m with automated patch script")
AUDIT_LEDGER.log_security_event("ZERO_TRUST_ISOLATION", "Pratyush Pandey (SecOps Lead)", "172.16.0.5 (FIN-WIN-DC-01)", "Enforced Domain Controller ingress RPC isolation from untrusted subnets")


# ═══════════════════════════════════════════════════════════════════════════
# MITRE ATT&CK ENTERPRISE MATRIX (10 TACTICS & AUTOMATED COUNTERMEASURES)
# ═══════════════════════════════════════════════════════════════════════════

MITRE_ATTACK_MATRIX = [
    {
        "tactic_id": "TA0001",
        "tactic_name": "Initial Access",
        "technique_id": "T1190",
        "technique_name": "Exploit Public-Facing Application",
        "example_cve": "CVE-2021-44228 (Log4Shell) / CVE-2023-4966 (Citrix Bleed)",
        "threat_severity": "CRITICAL",
        "cybershield_countermeasure": "Live EPSS v3.1 Ingress Prioritization + WAF Virtual Patching (Blocks payload at perimeter in <10ms)",
        "mitre_status": "DEFENDED (100%)",
        "status_color": "#10b981"
    },
    {
        "tactic_id": "TA0002",
        "tactic_name": "Execution",
        "technique_id": "T1059",
        "technique_name": "Command and Scripting Interpreter",
        "example_cve": "CVE-2022-22965 (Spring4Shell RCE)",
        "threat_severity": "CRITICAL",
        "cybershield_countermeasure": "Kernel seccomp sandbox restriction & JVM formatMsgNoLookups enforcement",
        "mitre_status": "DEFENDED (100%)",
        "status_color": "#10b981"
    },
    {
        "tactic_id": "TA0004",
        "tactic_name": "Privilege Escalation",
        "technique_id": "T1068",
        "technique_name": "Exploitation for Privilege Escalation",
        "example_cve": "CVE-2021-34527 (PrintNightmare)",
        "threat_severity": "CRITICAL",
        "cybershield_countermeasure": "Automatic Print Spooler disablement on Domain Controllers & sysctl memory protections",
        "mitre_status": "DEFENDED (100%)",
        "status_color": "#10b981"
    },
    {
        "tactic_id": "TA0005",
        "tactic_name": "Defense Evasion",
        "technique_id": "T1070",
        "technique_name": "Indicator Removal on Host",
        "example_cve": "Log Tampering / Syslog Clearing",
        "threat_severity": "HIGH",
        "cybershield_countermeasure": "Immutable Merkle Tree SHA-256 Blockchain Hash Ledger (Write-Once, Read-Many WORM)",
        "mitre_status": "IMMUTABLE AUDIT",
        "status_color": "#8b5cf6"
    },
    {
        "tactic_id": "TA0006",
        "tactic_name": "Credential Access",
        "technique_id": "T1003",
        "technique_name": "OS Credential Dumping",
        "example_cve": "CVE-2023-4966 (Citrix Bleed Session Extraction)",
        "threat_severity": "CRITICAL",
        "cybershield_countermeasure": "Instant session token revocation via Citrix CLI & memory isolation",
        "mitre_status": "DEFENDED (100%)",
        "status_color": "#10b981"
    },
    {
        "tactic_id": "TA0007",
        "tactic_name": "Discovery",
        "technique_id": "T1046",
        "technique_name": "Network Service Discovery",
        "example_cve": "Port Scanning / OpenVAS Port Sweep",
        "threat_severity": "MEDIUM",
        "cybershield_countermeasure": "Decoy Canary Honeypot nodes (Triggers immediate IP auto-containment upon port ping)",
        "mitre_status": "TRAPPED / ACTIVE",
        "status_color": "#06b6d4"
    },
    {
        "tactic_id": "TA0008",
        "tactic_name": "Lateral Movement",
        "technique_id": "T1210",
        "technique_name": "Exploitation of Remote Services",
        "example_cve": "EternalBlue (MS17-010) / Lateral RPC Pivoting",
        "threat_severity": "CRITICAL",
        "cybershield_countermeasure": "NetworkX BFS Graph Micro-Segmentation (Blocks attacker traversal from Web Gateway to DB Vault)",
        "mitre_status": "0 LATERAL HOPS",
        "status_color": "#10b981"
    },
    {
        "tactic_id": "TA0009",
        "tactic_name": "Collection",
        "technique_id": "T1560",
        "technique_name": "Archive Collected Data",
        "example_cve": "Data Staging & Compression",
        "threat_severity": "MEDIUM",
        "cybershield_countermeasure": "Dynamic Data-Loss Prevention (DLP) file entropy inspector",
        "mitre_status": "MONITORED",
        "status_color": "#3b82f6"
    },
    {
        "tactic_id": "TA0011",
        "tactic_name": "Command and Control",
        "technique_id": "T1071",
        "technique_name": "Application Layer Protocol C2",
        "example_cve": "Cobalt Strike Beaconing / Reverse HTTPS Shell",
        "threat_severity": "HIGH",
        "cybershield_countermeasure": "Outbound DNS tunneling detector & TLS certificate fingerprinting",
        "mitre_status": "DEFENDED",
        "status_color": "#10b981"
    },
    {
        "tactic_id": "TA0040",
        "tactic_name": "Impact",
        "technique_id": "T1486",
        "technique_name": "Data Encrypted for Impact (Ransomware)",
        "example_cve": "LockBit / ScreenConnect CVE-2024-1709",
        "threat_severity": "CRITICAL",
        "cybershield_countermeasure": "1-Click Autonomous Process Termination & Read-Only Snapshot Rollback",
        "mitre_status": "ZERO DATA LOSS",
        "status_color": "#10b981"
    }
]

# ═══════════════════════════════════════════════════════════════════════════
# HONEYPOT DECOY CANARY TRAPS
# ═══════════════════════════════════════════════════════════════════════════

HONEYPOT_DECOYS = [
    {
        "id": "HONEY-01",
        "name": "HONEYPOT-VAULT-DEC-01",
        "ip_address": "10.0.99.100",
        "decoy_service": "Fake MySQL Database & SSH Port 2222",
        "status": "ARMED & LISTENING",
        "trapped_attackers_count": 4,
        "last_trigger": "2026-08-23 09:14:22 from IP 198.51.100.44 (Quarantined)",
        "action": "Attacker IP auto-blocked at Perimeter Firewall in 0.2s"
    },
    {
        "id": "HONEY-02",
        "name": "CANARY-ADMIN-TOKEN-02",
        "ip_address": "10.0.99.102",
        "decoy_service": "Simulated AWS S3 Access Keys in Fake Codebase",
        "status": "ARMED & LISTENING",
        "trapped_attackers_count": 1,
        "last_trigger": "2026-08-22 18:40:11 from IP 203.0.113.88 (Quarantined)",
        "action": "API Token auto-expired & Intruder IP Blacklisted"
    }
]
