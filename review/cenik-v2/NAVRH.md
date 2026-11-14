# Ceník v2 (14. 11. 2026)

Kryštof schválil 14. 11. všechny body návrhu („souhlasím se vším“). Podklad: rešerše konkurence `C:\Users\Kryštof\tr-web-redesign-podklady\konkurence-2026-11\` (ceny k 14. 11. 2026), kontrola Claudem.

## Co se mění

| # | Změna | Proč (konkurence) | Web (tahle větev) | Aplikace |
|---|---|---|---|---|
| 1 | **Doplněk +50 firem za 990 Kč / 59 € měsíčně** k Solo Scout i Agency Pro, i víckrát; ročně 10 z 12 měsíců | Skok 150 → 400 firem nutil agenturu s ~200 firmami platit 7 990 Kč (upozornil i ChatGPT při hodnocení webu). 990 Kč za 50 firem ≈ 20 Kč za firmu = sazba Scale, takže od ~350 firem se dál vyplatí Scale. | `src/data/plans.json` `addons.extra50`, `{{price:extra50}}`, blok na `/cenik`, věta u ceníku na úvodní stránce, řádek v `llms.txt` | **chybí:** limit firem se dnes bere jen z tarifu (`core/plans.py` `TIER_LIMITS.max_companies`); potřeba počet balíčků na workspace a jeho přičtení k limitu, plus e-mail a faktura |
| 2 | **Napojení na AI asistenty (MCP) ve všech tarifech** | Vente AI ho má v základu za £59, Visualping a TheirStack i zdarma, Recruitis, Heyree a Saleskit taky. Jako prémiová funkce Agency Pro působil slabě. | `pp_t1_f10` u Solo Scout (Agency Pro a Scale ho mají přes „Vše ze…“), `pp_t2_f7` pryč, `pricing_common`, článek o ČR a CEE | **chybí:** přidat `"mcp"` do `_SOLO_FEATURES` v `core/plans.py` (vynucuje `core/oauth.py`) |
| 3 | Roční platba se slevou | Mají ji všichni (Recruit Signals −20 %, Paiger −20 %, Vente až −40 %) | **už existovala**: „2 měsíce zdarma“ (10 z 12), beze změny | už umí (`YEARLY_PAID_MONTHS = 10`) |
| 4 | **Import seznamu firem z Excelu / CSV i v Solo Scout** | Rozpor na našem webu: FAQ srovnání ho slibovalo všem, ceník jen Agency Pro. Kryštof 14. 11.: Solo to umí. | `pp_t1_f1` | **nesoulad:** příznak `crm_import` je v `core/plans.py` jen u Pro (zatím zřejmě nevynucený); až se bude vynucovat, musí Solo zůstat import seznamu firem |

U ChatGPT funguje vlastní MCP konektor jen v placených tarifech ChatGPT (Plus, Business…), u Claude i ve Free (1 konektor). Proto je v textu „u ChatGPT od jeho placeného tarifu“ (`support.claude.com` 11175166 ověřeno 14. 11.; OpenAI podle rešerše).

## Co se nemění

- Ceny tarifů 1 990 / 3 990 / 7 990 Kč (119 / 289 / 529 €). Solo Scout je mezi Vente AI (jen data, UK, bez zkoušky) a Recruit Signals Solo.
- Žádný prodej kontaktů na manažery (GDPR, VIZE).
- 14 dní zdarma bez karty, bez závazku.

## Podmínky vydání (blokující)

1. **Aplikace umí doplněk +50 firem** (bod 1), jinak web prodává něco, co nejde nastavit. Dočasně jde nastavit ručně, jen pokud jde limit firem workspace přepsat v databázi. Ověřit.
2. **MCP je zapnuté pro Solo Scout** (bod 2) **a napojení je vyzkoušené se skutečným Claude a ChatGPT** (STATUS `00mcp`: připojení z claude.ai 25. 10. selhalo, oprava `7c5aca9` nasazena, test se nezopakoval). Bez testu text o MCP z ceníku vyřadit, ne slibovat.
3. Kryštof potvrdí cenu doplňku (990 Kč / 59 €).
