document.addEventListener('DOMContentLoaded', function() {
    const deckContainer = document.getElementById('deck');
    const handContainer = document.getElementById('hand');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const probabilityResult = document.getElementById('probability-result');
    const handTitle = document.querySelector('.hand-title');

    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const selectedCards = [];

    // Probabilidades teóricas de cada mano (en porcentaje)
    const theoreticalProbabilities = {
        'Escalera Real': 0.000154,
        'Escalera de Color': 0.00139,
        'Póquer': 0.0240,
        'Full House': 0.144,
        'Color': 0.197,
        'Escalera': 0.392,
        'Trío': 2.11,
        'Doble Pareja': 4.75,
        'Pareja': 42.3,
        'Carta Alta': 50.1
    };

    // Crear el mazo de cartas
    function createDeck() {
        deckContainer.innerHTML = '';
        suits.forEach(suit => {
            values.forEach(value => {
                const card = document.createElement('div');
                card.className = `card ${suit === '♥' || suit === '♦' ? 'red' : 'black'}`;
                card.dataset.suit = suit;
                card.dataset.value = value;
                
                card.innerHTML = `
                    <div class="card-value">${value}</div>
                    <div class="card-suit">${suit}</div>
                    <div class="card-value bottom">${value}</div>
                `;
                
                card.addEventListener('click', () => selectCard(card, value + suit));
                deckContainer.appendChild(card);
            });
        });
    }

    // Seleccionar una carta
    function selectCard(cardElement, cardId) {
        const index = selectedCards.indexOf(cardId);
        
        if (index !== -1) {
            // Deseleccionar la carta
            selectedCards.splice(index, 1);
            cardElement.classList.remove('selected');
        } else if (selectedCards.length < 5) {
            // Seleccionar la carta
            selectedCards.push(cardId);
            cardElement.classList.add('selected');
        } else {
            alert("Ya has seleccionado 5 cartas. Usa el botón 'Reiniciar' para empezar de nuevo.");
            return;
        }
        
        updateHandDisplay();
        handTitle.textContent = `Tu Mano (${selectedCards.length}/5)`;
    }

    // Actualizar la visualización de la mano seleccionada
    function updateHandDisplay() {
        if (selectedCards.length === 0) {
            handContainer.innerHTML = '<div class="empty-hand">Selecciona 5 cartas del mazo</div>';
            return;
        }
        
        handContainer.innerHTML = '';
        selectedCards.forEach(cardId => {
            const value = cardId.slice(0, -1);
            const suit = cardId.slice(-1);
            
            const card = document.createElement('div');
            card.className = `card hand-card ${suit === '♥' || suit === '♦' ? 'red' : 'black'}`;
            
            card.innerHTML = `
                <div class="card-value">${value}</div>
                <div class="card-suit">${suit}</div>
                <div class="card-value bottom">${value}</div>
            `;
            
            handContainer.appendChild(card);
        });
    }

    // Calcular la probabilidad
    function calculateProbability() {
        if (selectedCards.length !== 5) {
            alert("Debes seleccionar exactamente 5 cartas.");
            return;
        }
        
        // Detectar el tipo de mano actual
        const currentHandType = detectHandType();
        
        // Obtener la probabilidad teórica para esta mano
        const probability = theoreticalProbabilities[currentHandType] || 0;
        
        // Mostrar resultados
        probabilityResult.innerHTML = `
            <p>Tu mano es: <span class="hand-type">${currentHandType}</span></p>
            <p>Probabilidad teórica de obtener esta mano:</p>
            <div class="probability-value">${probability}%</div>
            <p>1 en ${Math.round(10000/probability)/100}</p>
            
            <table class="probability-table">
                <tr>
                    <th>Tipo de Mano</th>
                    <th>Probabilidad</th>
                </tr>
                ${Object.entries(theoreticalProbabilities).map(([hand, prob]) => `
                    <tr ${hand === currentHandType ? 'style="background-color: rgba(58, 95, 205, 0.2)"' : ''}>
                        <td>${hand}</td>
                        <td><span class="probability-percent">${prob}%</span></td>
                    </tr>
                `).join('')}
            </table>
        `;
    }

    // Detectar el tipo de mano
    function detectHandType() {
        const suits = selectedCards.map(card => card.slice(-1));
        const values = selectedCards.map(card => card.slice(0, -1));
        const valueCounts = {};
        
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        
        const uniqueSuits = new Set(suits);
        const uniqueValues = new Set(values);
        const counts = Object.values(valueCounts).sort((a, b) => b - a);
        
        // Escalera real
        if (uniqueSuits.size === 1 && values.includes('10') && 
            values.includes('J') && values.includes('Q') && 
            values.includes('K') && values.includes('A')) {
            return "Escalera Real";
        }
        
        // Escalera de color (no real)
        if (uniqueSuits.size === 1 && isStraight(values)) {
            return "Escalera de Color";
        }
        
        // Póquer (4 del mismo valor)
        if (counts[0] === 4) return "Póquer";
        
        // Full house (3 + 2)
        if (counts[0] === 3 && counts[1] === 2) return "Full House";
        
        // Color (todas del mismo palo)
        if (uniqueSuits.size === 1) return "Color";
        
        // Escalera (valores consecutivos)
        if (isStraight(values)) return "Escalera";
        
        // Trío (3 del mismo valor)
        if (counts[0] === 3) return "Trío";
        
        // Doble pareja
        if (counts.filter(c => c === 2).length === 2) return "Doble Pareja";
        
        // Pareja
        if (counts[0] === 2) return "Pareja";
        
        // Carta alta
        return "Carta Alta";
    }

    // Función para detectar escalera
    function isStraight(values) {
        const valueOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const indices = values.map(v => valueOrder.indexOf(v)).sort((a, b) => a - b);
        
        // Escalera normal
        let isNormalStraight = true;
        for (let i = 1; i < indices.length; i++) {
            if (indices[i] - indices[i-1] !== 1) {
                isNormalStraight = false;
                break;
            }
        }
        if (isNormalStraight) return true;
        
        // Escalera de as bajo (A-2-3-4-5)
        if (values.includes('A') && values.includes('2') && 
            values.includes('3') && values.includes('4') && 
            values.includes('5')) {
            return true;
        }
        
        return false;
    }

    // Reiniciar el juego
    function resetGame() {
        selectedCards.length = 0;
        document.querySelectorAll('.card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        updateHandDisplay();
        handTitle.textContent = 'Tu Mano (0/5)';
        probabilityResult.innerHTML = '<p>Selecciona 5 cartas para calcular probabilidades</p>';
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculateProbability);
    resetBtn.addEventListener('click', resetGame);

    // Inicializar el juego
    createDeck();
});Z