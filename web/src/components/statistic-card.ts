export function createStatisticCard(title: string,value: string | number): HTMLElement {
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    const content = document.createElement("strong");
    card.classList.add("card");
    heading.textContent = title;
    content.textContent = String(value);
    card.append(heading, content);
    return card;
}