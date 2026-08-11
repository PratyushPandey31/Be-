import urllib.request, json

print("=== CyberShield AI - Final System Verification ===")
base = "http://127.0.0.1:8000/api"
eps = ["/health", "/assets", "/vulnerabilities", "/prioritize", "/dashboard/stats", "/evaluation/metrics", "/report/executive", "/ai/attack-path"]

all_ok = True
for ep in eps:
    try:
        r = urllib.request.urlopen(base + ep, timeout=5)
        data = json.loads(r.read().decode())
        if ep == "/health":
            print(f"  PASS {ep} -> {data['status']}")
        elif ep == "/assets":
            print(f"  PASS {ep} -> {len(data)} assets in DB")
        elif ep == "/vulnerabilities":
            print(f"  PASS {ep} -> {len(data)} CVEs in DB")
        elif ep == "/prioritize":
            top = data[0]
            print(f"  PASS {ep} -> {len(data)} findings, top risk: {top['ai_risk']['risk_score']}/100 {top['ai_risk']['threat_tier']}")
        elif ep == "/dashboard/stats":
            print(f"  PASS {ep} -> avg_risk={data['average_system_risk']}, CRIT={data['threat_distribution']['CRITICAL']}")
        elif ep == "/evaluation/metrics":
            g = data['performance_gains']
            print(f"  PASS {ep} -> speedup: {g['remediation_speedup']}")
        elif ep == "/report/executive":
            print(f"  PASS {ep} -> {len(data['prioritized_risks'])} risks in full report")
        elif ep == "/ai/attack-path":
            print(f"  PASS {ep} -> {len(data['nodes'])} attack graph nodes generated")
    except Exception as e:
        all_ok = False
        print(f"  FAIL {ep} -> {e}")

print()
print("Frontend : http://localhost:5173")
print("Backend  : http://localhost:8000")
print("API Docs : http://localhost:8000/docs")
print("RESULT   : ALL OK" if all_ok else "RESULT   : SOME FAILURES - check above")
