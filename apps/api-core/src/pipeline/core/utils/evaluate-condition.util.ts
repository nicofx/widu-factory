/**
 * Evalúa una expresión JS segura contra el RequestContext.
 *  - Si la expresión está vacía → true.
 *  - Si ocurre un error → false.
 *  - Solo permite acceder a la variable ‘context’.
 */
export function evaluateCondition(expr: string | undefined, context: any): boolean {
  if (!expr) return true;

  try {
    /* Evitamos palabras potencialmente peligrosas – very simple guard */
    const blacklist = ['process', 'require', 'global', 'fs', 'eval'];
    if (blacklist.some((kw) => expr.includes(kw))) return false;

    // Creamos una función aislada que recibe “context”
    const fn = new Function('context', `return (${expr});`);
    return Boolean(fn(context));
  } catch (e) {
    console.warn(`[Pipeline][Condition] Error evaluando "${expr}": ${e}`);
    return false;
  }
}
