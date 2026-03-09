# Module Registry

| Módulo (dir) | id | Path | Mobile | Desktop |
|---|---|---|---|---|
| `home` | `home` | `/` | ✅ | ✅ |
| `gym` | `gym_tracker` | `/gym` | ✅ | ✅ |
| `expenses` | `expenses_tracker` | `/expenses` | ✅ | ✅ |
| `macro` | `macro_tracker` | `/macro` | ⏳ pendiente | ✅ |
| `flights` | `flights_tracker` | `/flights` | ✅ | ✅ |
| `travels` | `travels_tracker` | `/travels` | ✅ | ✅ |
| `calendar` | `calendar_tracker` | `/calendar` | ✅ | ✅ |
| `automations` | `automations_engine` | `/automations` | ✅ | ✅ |

## Notes

- El `id` debe coincidir exactamente con el `module_id` del backend
- `home` es el único módulo `permanent: true` — su tab no se puede cerrar
- `macro` no tiene `MacroPageMobile` todavía — pendiente de implementar
- `automations` es el más complejo — usa XYFlow para el editor de flujos
