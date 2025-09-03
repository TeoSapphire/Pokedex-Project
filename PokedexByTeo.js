//Type--normal etc... (PokémonTypeCSS)
const type_class = n => `type type--${n}`;

//All DOM elements
const errorBox = document.querySelector(".errorContainer");
const errorMSG = document.getElementById("errorText");
const button = document.getElementById("myBTN");
const pokemonInfo = document.getElementById("pokemonInfo");
const pokemonTypeInfo = document.getElementById("pokemonType");
const imgPokemon = document.getElementById("pokemonSprite");
const cardContainer = document.getElementById("cardContainer");

//Function to clear all
function clearUI(){
    errorBox.style.display = "none";
    cardContainer.style.display = "none";
    imgPokemon.style.display = "none";
    pokemonInfo.style.display = "none";
    pokemonTypeInfo.style.display = "none";
    pokemonInfo.textContent = "";
    pokemonTypeInfo.innerHTML = "";
}

//Show Errors function
function showErrors(msg){
    errorMSG.textContent = msg || "Pokémon Not Found...";
    errorBox.style.display = "flex";
    cardContainer.style.display = "none";
}

//function to clear and rebuild types label
function cleanerTypes (typesAPI, targetElement){

    targetElement.innerHTML = "";

    /*If not types exist, just hide the container */
    if(!Array.isArray(typesAPI) || !typesAPI.length){
        targetElement.style.display = "none";
        return;
    }

    /*Sort by slot (EX: first before the second slot) */
    const type_names = [...typesAPI].sort((a, b) => a.slot - b.slot).map(t => t.type.name);

    /*Create new span to contain and to append container*/
    type_names.forEach(n => { 
        const span = document.createElement("span");
        span.className = type_class(n);
        span.textContent = n.charAt(0).toUpperCase() + n.slice(1);
        targetElement.appendChild(span);
    });
    targetElement.style.display = "inline-flex";
}

/*EvenListener when you click a button*/
button.addEventListener("click", () =>{
    const inputName = document.getElementById("pokemonInput").value.toLowerCase();

    clearUI();
    
    if(!inputName){ //Show errors
        showErrors("Pokémon Not Found...");
        return;
    }
    
    pokemonFetch(); //Call the main API function
});

/*Main async function that fetches Pokémon data*/

async function pokemonFetch(){

    try{

        button.disabled = true; //loading state -> disable search buttom

        const pokemonName = document.getElementById("pokemonInput").value.trim().toLowerCase();  //Get the user input (Pokémon ID/Name)

        //Hide all before to start
        errorBox.style.display = "none";
        imgPokemon.style.display = "none";
        pokemonInfo.style.display = "none";
        pokemonTypeInfo.style.display = "none";
        cardContainer.style.display = "none";
        pokemonTypeInfo.innerHTML = "";
        pokemonInfo.innerHTML = "";

        /*Input error -> throw error*/
        if(!pokemonName){
            throw new Error("Pokémon Not Found...");
        }

        //First fetch: Pokémon species (checks if Pokémon exists)
        const errorInput = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(pokemonName)}`);

        //API errors = custom messages
        if(!errorInput.ok){
            
            if(errorInput.status === 404) throw new Error("Pokémon Not Found");
            if(errorInput.status === 429) throw new Error("Too many request! Please, wait and try again!");
            throw new Error(`Error ${errorInput.status}`);
        }

        const data = await errorInput.json();

        //Pokémon Type (Get default variety main pokemon)
        const defTypes = data.varieties.find(v => v.is_default) || data.varieties[0];

        //Second fetch : we can get Pokémon Types, Ability, Stats
        const formType = await fetch(defTypes.pokemon.url);
        if(!formType.ok){
            throw new Error ("Type Pokemon not found");
        }
        const data2 = await formType.json();

        //Display Pokémon types
        cleanerTypes(data2.types, document.getElementById("pokemonType"));

        //Pokémon SPrites fallback to GitHub if missing
        const pokemonID = data2.id;
        const pkSprite = data2.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonID}.png`;

        //Show sprites and Pokémon Card
        imgPokemon.src = pkSprite;
        cardContainer.style.display = "block";
        imgPokemon.style.display = "block";

        //Format PokémonInfo
        const nameInfo = data2.name.charAt(0).toUpperCase() + data2.name.slice(1);
        pokemonInfo.style.display = "block";
        pokemonInfo.textContent = `#${String(pokemonID).padStart(4, "0")} - ${nameInfo}`;

        errorBox.style.display = "none";
    }

    /*Catch Error*/
    catch(error){
        showErrors(error.message);
    }
    finally{
        button.disabled = false;
    }
}