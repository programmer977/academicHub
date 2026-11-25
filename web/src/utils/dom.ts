export function requireElement<T extends Element>(root: ParentNode,selector: string): T {
    const element = root.querySelector<T>(selector);
    if (!element) {
        throw new Error(
            `Elemento não encontrado: ${selector}`
        );
    }
    return element;
}