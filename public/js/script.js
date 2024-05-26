function filterItems(category) {
    const filteredItems = items.filter(item => item.category === category);
    displayItems(filteredItems);
}

function displayItems(itemsToDisplay) {
    const itemList = document.getElementById("item-list");
    itemList.innerHTML = "";
    itemsToDisplay.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name} Image">
            <div>
                <h3>${item.name}</h3>
                <p>$${item.price}</p>
            </div>
        `;
        itemList.appendChild(li);
    });
}
