const searchBar = document.querySelector('.header__search__bar');
const recipeSection = document.querySelector('.recipe');
const utensilsList = document.getElementById("ustensils_list");
const ingredientList = document.getElementById("ingredient_list");
const applianceList = document.getElementById("appliance_list");
const filterSelection = document.getElementById('all__filter__selection'); //Liste de tous les filtres en barre visuel

let filteredRecipes = [];
let filteredTagRecipes = [];
let inputText  = '';

const selectedTags = new Set(); // Création du Set pour stocker les tags sélectionnés

window.addEventListener('load', function() {
    filteredRecipes = recipes;
    displayTags(filteredRecipes);
    displayAllRecipes(recipes);
});

let requestId; // Variable pour stocker l'ID de la requête d'animation
let hasElseRun = true; // Variable pour stocker si le bloc else a été exécuté
searchBar.addEventListener('input', function() {
    cancelAnimationFrame(requestId); // Annule la requête d'animation précédente

    inputText = searchBar.value.toLowerCase();
    selectedTags.clear(); //efface les tags sélectionnés si on modifie la recherche
    if (inputText.length >= 3) {
        hasElseRun = false; // Réinitialisez hasElseRun à false lorsque vous entrez dans le bloc if
        recipeSection.innerText = '';
        const data = filterByInputText()
        filteredRecipes = data;

        const filterNumberElement = document.querySelector('.filter__number');
        filterNumberElement.textContent = `${filteredRecipes.length} recettes`;

        displayTags(filteredRecipes);
    }
    else if (!hasElseRun) { // Modifiez cette ligne pour vérifier si hasElseRun est false
        hasElseRun = true; // Définissez hasElseRun sur true avant d'exécuter le bloc else
        filteredRecipes = recipes;
        displayTags(filteredRecipes);
        displayAllRecipes(recipes);
    }
});

ingredientList.addEventListener("click", handleItemClick);
applianceList.addEventListener("click", handleItemClick);
utensilsList.addEventListener("click", handleItemClick);
filterSelection.addEventListener("click", handleItemClick);
function handleItemClick(event) {
    cancelAnimationFrame(requestId);

    const clickedItem = event.target.textContent; // Récupère le texte de l'élément cliqué

    if (clickedItem === null || clickedItem === '') {
        return; // Sort de la fonction si la valeur est null ou une chaîne vide
    }

    if (selectedTags.has(clickedItem)) {
        selectedTags.delete(clickedItem); // Si le tag est déjà sélectionné, le supprimer du Set
    } else {
        selectedTags.add(clickedItem); // Sinon, l'ajouter au Set
    }
    if (selectedTags.size === 0) {
        filteredTagRecipes = filteredRecipes;
        displayTags(filteredRecipes);
        displayAllRecipes(filteredTagRecipes);
    }
    else {
        recipeSection.innerText = '';
        filteredTagRecipes = filteredRecipes.filter((recipe) => {
            const recipeIngredients = recipe.ingredients.map((ingredient) => ingredient.ingredient);
            const recipeUtensils = recipe.ustensils;

            const hasAllTags = Array.from(selectedTags).every((tag) => {
                return (
                    recipeIngredients.includes(tag) ||
                    recipe.appliance === tag ||
                    recipeUtensils.includes(tag)
                );
            });
            return hasAllTags;
        });

        const filterNumberElement = document.querySelector('.filter__number');
        filterNumberElement.textContent = `${filteredTagRecipes.length} recettes`;

        for (let i = 0; i < filteredTagRecipes.length; i++) {
            const recipe = filteredTagRecipes[i];
            const recipeCard = createRecipeCard(recipe);
            recipeSection.appendChild(recipeCard);
        }
        displayTags(filteredTagRecipes);
    }
}

const filterByInputText = () => {
    let filteredRecipes = []; // Optimisation possible avec préallocation si le nombre de recettes est connu
    const lowerCaseInputText = inputText.toLowerCase();

    for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];
        const lowerCaseRecipeName = recipe.name.toLowerCase();
        const lowerCaseRecipeDescription = recipe.description.toLowerCase();

        if (lowerCaseRecipeName.includes(lowerCaseInputText)) {
            filteredRecipes.push(recipe);
            continue;
        }

        let ingredientMatch = false;
        for (let ingredient of recipe.ingredients) {
            if (ingredient.ingredient.toLowerCase().includes(lowerCaseInputText)) {
                ingredientMatch = true;
                break;
            }
        }

        if (ingredientMatch || lowerCaseRecipeDescription.includes(lowerCaseInputText)) {
            filteredRecipes.push(recipe);
        }
    }

    // Création des cartes de recettes après la filtration pour minimiser les manipulations du DOM
    for (let recipe of filteredRecipes) {
        const recipeCard = createRecipeCard(recipe);
        recipeSection.appendChild(recipeCard);
    }

    return filteredRecipes;
};

function displayTags(data) {
    //Creation des array sans doublons
    const ingredients = Array.from(
        new Set(
            data
                .flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.ingredient))
        )
    );

    const appliances = Array.from(
        new Set(
            data.map((recipe) => recipe.appliance)
        )
    );

    const utensils = Array.from(
        new Set(
            data.flatMap((recipe) => recipe.ustensils)
        )
    );

    ingredientList.innerText = '';
    ingredients.forEach((ingredient) => {
        const span = document.createElement('span');
        span.classList.add('listbox__list__item');
        span.textContent = ingredient;
        if (selectedTags.has(ingredient)) {
            span.classList.add('selected'); // Ajoute la classe "selected" si l'élément est sélectionné
            const icon = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-circle-xmark');
            span.appendChild(icon);
        }
        ingredientList.appendChild(span);
    });

    applianceList.innerText = '';
    appliances.forEach((appliance) => {
        const span = document.createElement('span');
        span.classList.add('listbox__list__item');
        span.textContent = appliance;
        if (selectedTags.has(appliance)) {
            span.classList.add('selected'); // Ajoute la classe "selected" si l'élément est sélectionné
            const icon = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-circle-xmark');
            span.appendChild(icon);
        }
        applianceList.appendChild(span);
    });

    utensilsList.innerText = '';
    utensils.forEach((ustensils) => {
        const span = document.createElement('span');
        span.classList.add('listbox__list__item');
        span.textContent = ustensils;
        if (selectedTags.has(ustensils)) {
            span.classList.add('selected'); // Ajoute la classe "selected" si l'élément est sélectionné
            const icon = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-circle-xmark');
            span.appendChild(icon);
        }
        utensilsList.appendChild(span);
    });

    const filterSelection = document.querySelector('.filter__selection');

    // Supprimer les anciens éléments
    filterSelection.innerText = '';

    // Parcourir les éléments sélectionnés
    selectedTags.forEach((tag) => {
        const span = document.createElement('span');
        span.classList.add('filter__selection__tag');
        span.textContent = tag;
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-xmark');
        span.appendChild(icon);
        filterSelection.appendChild(span);
    });
}

function createRecipeCard(recipe) {
    const fragment = document.createDocumentFragment();

    const article = document.createElement('article');
    article.classList.add('recipe__card', 'fade-in-recipe');
    article.id = recipe.id;
    article.style.setProperty('--fadeinDelayRecipe', '0.6s');
    fragment.appendChild(article);

    const time = document.createElement('span');
    time.classList.add('recipe__card__time');
    time.textContent = recipe.time + 'min';
    article.appendChild(time);

    const image = document.createElement('img');
    image.classList.add('recipe__card__image');
    image.src = './assets/recette/' + recipe.image;
    image.alt = recipe.name;
    article.appendChild(image);

    const content = document.createElement('div');
    content.classList.add('recipe__card__content');
    article.appendChild(content);

    const title = document.createElement('h2');
    title.textContent = recipe.name;
    content.appendChild(title);

    const subtitle = document.createElement('h3');
    subtitle.textContent = 'Recette';
    content.appendChild(subtitle);

    const description = document.createElement('div');
    description.classList.add('recipe__card__content__description');
    description.textContent = recipe.description;
    content.appendChild(description);

    const ingredientsTitle = document.createElement('h3');
    ingredientsTitle.textContent = 'Ingrédients';
    content.appendChild(ingredientsTitle);

    const ingredientsContainer = document.createElement('div');
    ingredientsContainer.classList.add('recipe__card__content__ingredients');
    content.appendChild(ingredientsContainer);

    recipe.ingredients.forEach(function(ingredient) {
        const ingredientElement = document.createElement('div');
        ingredientElement.classList.add('recipe__card__content__ingredients__ingredient');
        ingredientsContainer.appendChild(ingredientElement);

        const ingredientName = document.createElement('h4');
        ingredientName.textContent = ingredient.ingredient;
        ingredientElement.appendChild(ingredientName);

        if (ingredient.quantity) {
            const ingredientQuantity = document.createElement('span');
            ingredientQuantity.textContent = ingredient.quantity + (ingredient.unit ? ingredient.unit : '');
            ingredientElement.appendChild(ingredientQuantity);
        }
    });

    return fragment;
}

function displayAllRecipes(data) {
    recipeSection.innerText = '';
    const delay = 100; // Délai en millisecondes entre chaque ajout de carte

    const filterNumberElement = document.querySelector('.filter__number');
    filterNumberElement.textContent = `${data.length} recettes`;

    data.forEach((recipe, i) => {
        const recipeCard = createRecipeCard(recipe);
        recipeSection.appendChild(recipeCard);

        if (i < data.length - 1) { //delay entre chaque ajout de carte
            setTimeout(() => {
            }, delay);
        }
    });
}


const btn = document.querySelector('.header__search__btn');
const circle = btn.querySelector('circle');
const line = btn.querySelector('line');

btn.addEventListener('mouseover', () => {
    circle.setAttribute('stroke', 'black');
    line.setAttribute('stroke', 'black');
});

btn.addEventListener('mouseout', () => {
    circle.setAttribute('stroke', 'white');
    line.setAttribute('stroke', 'white');
});

//Apparition de la liste de filtre pour les 3 listbox de filtre
const listboxHeads = document.querySelectorAll('.listbox__head');   //titre de la liste de filtre
const listboxLists = document.querySelectorAll('.listbox__list');   //liste de filtre
const listboxSearchBars = document.querySelectorAll('.listbox__searchbar');     //barre de recherche dans la liste de filtre
const chevronIcons = document.querySelectorAll('.fa-solid.fa-chevron-down');    //icon de dropdown

listboxHeads.forEach((listboxHead, index) => {
    listboxHead.addEventListener('click', () => {
        if (listboxLists[index].style.display === 'flex') {
            listboxLists[index].style.display = 'none';
            listboxSearchBars[index].style.display = 'none';
            chevronIcons[index].classList.remove('fa-rotate-180');
        } else {
            listboxLists[index].style.display = 'flex';
            listboxSearchBars[index].style.display = 'flex';
            chevronIcons[index].classList.add('fa-rotate-180');
        }
    });
});

const searchIngredient = document.getElementById("search-ingredient");
const searchAppliance = document.getElementById("search-appareil");
const searchUtensil = document.getElementById("search-ustensiles");
searchIngredient.addEventListener('input', function() {
    const searchText = searchIngredient.value.toLowerCase();

    const ingredients = Array.from(ingredientList.children);
    ingredients.forEach((ingredient) => {
        const ingredientText = ingredient.textContent.toLowerCase();
        if (ingredientText.includes(searchText)) {
            ingredient.style.display = 'block';
        } else {
            ingredient.style.display = 'none';
        }
    });
});

searchAppliance.addEventListener('input', function() {
    const searchText = searchAppliance.value.toLowerCase();

    const appliances = Array.from(applianceList.children);
    appliances.forEach((appliance) => {
        const applianceText = appliance.textContent.toLowerCase();
        if (applianceText.includes(searchText)) {
            appliance.style.display = 'block';
        } else {
            appliance.style.display = 'none';
        }
    });
});

searchUtensil.addEventListener('input', function() {
    const searchText = searchUtensil.value.toLowerCase();

    const utensils = Array.from(utensilsList.children);
    utensils.forEach((utensil) => {
        const utensilText = utensil.textContent.toLowerCase();
        if (utensilText.includes(searchText)) {
            utensil.style.display = 'block';
        } else {
            utensil.style.display = 'none';
        }
    });
});