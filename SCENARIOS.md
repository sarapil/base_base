# Base Base — Scenarios & Impact Matrix
# القاعدة الأساسية

> DocType/API/Page scenarios with business impact assessment.

## Core Scenarios

### 1. Sidebar Menu Generation
| Aspect | Detail |
|--------|--------|
| **Trigger** | User logs in / sidebar loads |
| **Flow** | boot.py → sidebar config injected → base_base.js renders menu |
| **APIs** | `get_sidebar_menu` |
| **Impact** | HIGH — core navigation for all apps |

### 2. Home Page Redirect
| Aspect | Detail |
|--------|--------|
| **Trigger** | User visits root URL |
| **Flow** | redirect_home → /desk/home |
| **APIs** | `redirect_home`, `get_home_page` |
| **Impact** | HIGH — entry point |

### 3. Permission-Based Menu Filtering
| Aspect | Detail |
|--------|--------|
| **Trigger** | Sidebar renders for each user |
| **Flow** | boot.py checks user roles → filters menu categories |
| **Impact** | HIGH — security |


---

## Impact Legend
- **HIGH** — Core functionality, blocks usage if broken
- **MEDIUM** — Important but has workarounds
- **LOW** — Nice-to-have, minimal disruption if unavailable
