// Barrel do módulo — espelha o padrão dos módulos internos do portal.
// O `src/modules/index.ts` do portal-host re-exporta o `<camelId>Routes`
// daqui pra montar o router. O `import './<id>/module'` (também no
// agregador do portal) registra o módulo no registry via side-effect.

export { fechamentoMaestroModule } from './module'
export { fechamentoMaestroRoutes } from './routes'
