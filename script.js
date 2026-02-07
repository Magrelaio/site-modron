/* 
ESSE CODIGO TEM ANOS DE IDADE E EU ACHO Q EU USEI IA, DESCULPA PESSOAL ;-;
*/

class InventorySystem {
    constructor() {
        this.inventories = {};
        this.currentUser = 'guest';
        this.loadFromStorage();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('modron_inventories');
        if (saved) {
            this.inventories = JSON.parse(saved);
        }
    }

    saveToStorage() {
        localStorage.setItem('modron_inventories', JSON.stringify(this.inventories));
        this.updateInventoryDisplay();
    }

    createInventory(characterName) {
        if (this.inventories[this.currentUser]) {
            return { success: false, message: "Você já possui um inventário! Delete o atual antes de criar um novo." };
        }

        this.inventories[this.currentUser] = {
            characterName: characterName,
            items: [],
            gold: 0,
            createdAt: new Date().toISOString()
        };

        this.saveToStorage();
        return { success: true, message: `Inventário criado com sucesso para ${characterName}!` };
    }

    deleteInventory() {
        if (!this.inventories[this.currentUser]) {
            return { success: false, message: "Você não possui um inventário para deletar." };
        }

        const charName = this.inventories[this.currentUser].characterName;
        delete this.inventories[this.currentUser];
        this.saveToStorage();
        return { success: true, message: `Inventário de ${charName} deletado com sucesso!` };
    }

    addItem(itemName, quantity = 1, description = "") {
        if (!this.inventories[this.currentUser]) {
            return { success: false, message: "Crie um inventário primeiro usando /criar_inventario" };
        }

        const inventory = this.inventories[this.currentUser];
        const existingItem = inventory.items.find(item => item.name.toLowerCase() === itemName.toLowerCase());

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
            if (description) existingItem.description = description;
        } else {
            inventory.items.push({
                name: itemName,
                quantity: parseInt(quantity),
                description: description,
                addedAt: new Date().toISOString()
            });
        }

        this.saveToStorage();
        return { success: true, message: `Adicionado ${quantity}x ${itemName} ao inventário!` };
    }

    deleteItem(itemName) {
        if (!this.inventories[this.currentUser]) {
            return { success: false, message: "Você não possui um inventário." };
        }

        const inventory = this.inventories[this.currentUser];
        const initialLength = inventory.items.length;
        inventory.items = inventory.items.filter(item => item.name.toLowerCase() !== itemName.toLowerCase());

        if (inventory.items.length === initialLength) {
            return { success: false, message: `Item "${itemName}" não encontrado no inventário.` };
        }

        this.saveToStorage();
        return { success: true, message: `Item "${itemName}" removido do inventário!` };
    }

    addGold(amount) {
        if (!this.inventories[this.currentUser]) {
            return { success: false, message: "Crie um inventário primeiro usando /criar_inventario" };
        }

        this.inventories[this.currentUser].gold += parseInt(amount);
        this.saveToStorage();
        return { success: true, message: `Adicionado ${amount} de ouro ao inventário!` };
    }

    getInventory() {
        return this.inventories[this.currentUser] || null;
    }

    updateInventoryDisplay() {
        const display = document.getElementById('inventoryDisplay');
        const inventory = this.getInventory();

        if (!inventory) {
            display.innerHTML = '<div class="no-items">Nenhum inventário criado ainda. Use <span class="slash-command">/criar_inventario</span> para começar!</div>';
            return;
        }

        let itemsHtml = '';
        if (inventory.items.length > 0) {
            itemsHtml = inventory.items.map(item => `
                <div class="inventory-item">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">${item.quantity}</div>
                </div>
            `).join('');
        } else {
            itemsHtml = '<div class="no-items">Nenhum item no inventário</div>';
        }

        display.innerHTML = `
            <div class="inventory-header">
                <div>
                    <strong>${inventory.characterName}</strong>
                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">
                        Criado em ${new Date(inventory.createdAt).toLocaleDateString()}
                    </div>
                </div>
                <div style="font-size: 1.2rem; color: gold;">
                    <i class="fas fa-coins"></i> ${inventory.gold} ouro
                </div>
            </div>
            <div class="inventory-items">
                ${itemsHtml}
            </div>
        `;
    }
}

const inventorySystem = new InventorySystem();

const users = [
    { name: "Você", avatar: "V", color: "#5865f2", isPlayer: true }, // Jogador atual
    { name: "Ragnar, O Bárbaro (17/17)", avatar: "RO", color: "#ed4245", isPlayer: false },
    { name: "Meredith, A Curandeira (14/14)", avatar: "MA", color: "#faa61a", isPlayer: false }
];

function getCurrentPlayer() {
    return users[0];
}

function getRandomNPC() {
    const npcs = users.filter(user => !user.isPlayer);
    return npcs[Math.floor(Math.random() * npcs.length)];
}

function getNPCByName(name) {
    return users.find(user => 
        !user.isPlayer && user.name.toLowerCase().includes(name.toLowerCase())
    ) || getRandomNPC();
}
function rollDice(command) {
    command = command.trim().toLowerCase();
    
    if (!command.includes('d')) {
        return null;
    }
    const parts = command.split('d');
    if (parts.length < 2) {
        return null;
    }
    
    let diceNumber = 1;
    let diceType = parts[1];
    let bonus = 0;
    let operation = '+';
    if (parts[0] && parts[0].trim() !== '') {
        diceNumber = parseInt(parts[0]);
        if (isNaN(diceNumber) || diceNumber < 1) {
            diceNumber = 1;
        }
    }
    if (diceType.includes('+')) {
        const diceParts = diceType.split('+');
        diceType = diceParts[0];
        bonus = parseInt(diceParts[1]) || 0;
        operation = '+';
    } else if (diceType.includes('-')) {
        const diceParts = diceType.split('-');
        diceType = diceParts[0];
        bonus = parseInt(diceParts[1]) || 0;
        operation = '-';
    } else if (diceType.includes('*')) {
        const diceParts = diceType.split('*');
        diceType = diceParts[0];
        bonus = parseInt(diceParts[1]) || 1;
        operation = '*';
    }
    
    diceType = parseInt(diceType);
    if (isNaN(diceType) || diceType < 1) {
        return null;
    }
    
    if (diceNumber > 25) {
        return { error: 'Número de dados muito alto! Tente um numero mais baixo por favor (máximo de 25)' };
    }
    
    if (diceType > 200) {
        return { error: 'Número de lados muito alto! Tente um numero mais baixo por favor (máximo de 200)' };
    }

    const rolls = [];
    for (let i = 0; i < diceNumber; i++) {
        rolls.push(Math.floor(Math.random() * diceType) + 1);
    }
    
    rolls.sort((a, b) => a - b);
    
    let total = rolls.reduce((sum, roll) => sum + roll, 0);
    let rollStr = `${diceNumber}d${diceType}`;
    
    if (operation === '+') {
        total += bonus;
        if (bonus > 0) rollStr += `+${bonus}`;
    } else if (operation === '-') {
        total -= bonus;
        if (bonus > 0) rollStr += `-${bonus}`;
    } else if (operation === '*') {
        total *= bonus;
        if (bonus > 1) rollStr += `*${bonus}`;
    }
    
    const formattedRolls = rolls.map(roll => {
        if (roll === 1 || roll === diceType) {
            return `<strong>${roll}</strong>`;
        }
        return roll;
    }).join(', ');
    
    return {
        total,
        rolls: formattedRolls,
        rollStr,
        originalRolls: rolls,
        diceType,
        isCritical: rolls.includes(diceType),
        isFumble: rolls.includes(1)
    };
}

function processSlashCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch(cmd) {
        case '/criar_inventario':
            if (args.length < 1) {
                return { success: false, message: "Uso: /criar_inventario nome_do_personagem" };
            }
            const charName = args.join(' ');
            return inventorySystem.createInventory(charName);

        case '/ver_inventario':
            const inventory = inventorySystem.getInventory();
            if (!inventory) {
                return { success: false, message: "Você não possui um inventário. Use /criar_inventario primeiro." };
            }
            return { 
                success: true, 
                message: `📦 **Inventário de ${inventory.characterName}**\n` +
                        `💰 **Ouro:** ${inventory.gold}\n` +
                        `📋 **Itens (${inventory.items.length}):**\n` +
                        (inventory.items.length > 0 ? 
                         inventory.items.map(item => `• ${item.name} x${item.quantity}${item.description ? ` - ${item.description}` : ''}`).join('\n') :
                         "Nenhum item no inventário")
            };

        case '/adicionar_item':
            if (args.length < 2) {
                return { success: false, message: "Uso: /adicionar_item \"nome do item\" quantidade [descrição]" };
            }
            
            let itemName, quantity, description;
            
            const lastArg = args[args.length - 1];
            const secondLastArg = args[args.length - 2];
            
            const quantityTest = parseInt(lastArg);
            if (!isNaN(quantityTest)) {
                quantity = quantityTest;
                itemName = args.slice(0, -1).join(' ');
                description = "";
            } else {
                const quantityTest2 = parseInt(secondLastArg);
                if (!isNaN(quantityTest2) && args.length >= 3) {
                    quantity = quantityTest2;
                    itemName = args.slice(0, -2).join(' ');
                    description = args[args.length - 1];
                } else {
                    return { 
                        success: false, 
                        message: "Uso: /adicionar_item \"nome do item\" quantidade [descrição]\nExemplo: /adicionar_item \"Poção de Cura\" 3 Recupera 2d6+2 PV" 
                    };
                }
            }
            
            return inventorySystem.addItem(itemName, quantity, description);

        case '/deletar_item':
            if (args.length < 1) {
                return { success: false, message: "Uso: /deletar_item nome_do_item" };
            }
            const itemToDelete = args.join(' ');
            return inventorySystem.deleteItem(itemToDelete);

        case '/deletar_inventario':
            return inventorySystem.deleteInventory();

        case '/adicionar_ouro':
            if (args.length < 1) {
                return { success: false, message: "Uso: /adicionar_ouro quantidade" };
            }
            const goldAmount = parseInt(args[0]);
            if (isNaN(goldAmount)) {
                return { success: false, message: "Quantidade inválida. Use um número." };
            }
            return inventorySystem.addGold(goldAmount);

        case '/comandos':
            return {
                success: true,
                message: "📋 Comandos Disponíveis:\n" +
                        "• `/criar_inventario nome` - Cria um novo inventário\n" +
                        "• `/ver_inventario` - Mostra seu inventário\n" +
                        "• `/adicionar_item \"nome\" qtd [desc]` - Adiciona item\n" +
                        "• `/deletar_item nome` - Remove item\n" +
                        "• `/deletar_inventario` - Deleta seu inventário\n" +
                        "• `/adicionar_ouro qtd` - Adiciona ouro\n" +
                        "• **Rolagens:** `d20`, `2d6+3`, `d100-5`, etc."
            };

        default:
            return { success: false, message: `Comando "${cmd}" não reconhecido. Use /comandos para ver todos os comandos.` };
    }
}

function addMessage(author, text, isBot = false, result = null, forceUser = null) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    let user;
    if (isBot) {
        user = null;
    } else if (forceUser) {
        user = forceUser;
    } else {
        user = getCurrentPlayer();
    }
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = `avatar ${isBot ? 'bot-avatar rounded-full' : 'user-avatar rounded-full p-1'}`;
    
    if (isBot) {
        avatarDiv.innerHTML = '<i class="fas fa-robot rounded-full bg-blue-600 p-1"></i>';
    } else {
        avatarDiv.textContent = user.avatar;
        avatarDiv.style.backgroundColor = user.color;
    }
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content ';
    
    const authorDiv = document.createElement('div');
    authorDiv.className = `message-author font-bold underline ${isBot ? 'bot-author' : 'user-author'}`;
    authorDiv.textContent = author;
    if (!isBot) {
        authorDiv.style.color = user.color;
    }
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';

    if (text.startsWith('/')) {
        textDiv.innerHTML = `<span class="slash-command">${text.split(' ')[0]}</span> ${text.substring(text.indexOf(' ') + 1)}`;
        const previewDiv = document.createElement('div');
        previewDiv.className = 'slash-command-preview';
        
        const cmd = text.split(' ')[0];
        if (cmd === '/criar_inventario') {
            const charName = text.split(' ').slice(1).join(' ');
        } else if (cmd === '/adicionar_item') {
            const args = text.substring(cmd.length + 1).split(' ');
            if (args.length >= 2) {
                const quantity = args[args.length - 1];
                const itemName = args.slice(0, -1).join(' ');
            } else {
                previewDiv.innerHTML = `Adicionando item ao inventário`;
            }
        } else if (cmd === '/ver_inventario') {
            previewDiv.innerHTML = `Exibindo inventário`;
        }
        
        textDiv.appendChild(previewDiv);
    } else {
        textDiv.innerHTML = text;
    }
    
    contentDiv.appendChild(authorDiv);
    contentDiv.appendChild(textDiv);
    
    if (result) {
        const resultDiv = document.createElement('div');
        
        if (result.error) {
            resultDiv.className = 'inventory-result error';
            resultDiv.innerHTML = `Erro: ${result.error}`;
        } else if (result.isCritical || result.isFumble) {
            resultDiv.className = `dice-result ${result.isCritical ? 'critical' : 'fumble'}`;
            resultDiv.innerHTML = `<strong>${result.total}</strong> ⟵ [${result.rolls}] ${result.rollStr}`;
        } else if (result.total !== undefined) {
            resultDiv.className = 'dice-result';
            resultDiv.innerHTML = `<strong>${result.total}</strong> ⟵ [${result.rolls}] ${result.rollStr}`;
        } else if (result.success !== undefined) {
            resultDiv.className = `inventory-result ${result.success ? 'success' : 'error'}`;
            resultDiv.innerHTML = `${result.success ? '✅' : '❌'} ${result.message}`;
        }
        
        contentDiv.appendChild(resultDiv);
    }
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    messageDiv.style.opacity = '0';
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.3s';
        messageDiv.style.opacity = '1';
    }, 10);
}

document.getElementById('chatForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    input.value = '';
    const currentPlayer = getCurrentPlayer();
    addMessage(currentPlayer.name, message, false);
    setTimeout(() => {
        if (message.startsWith('/')) {
            const result = processSlashCommand(message);
            addMessage('Modron Alpha', '', true, result);
        } else if (message.includes('d')) {
            const result = rollDice(message);
            if (result && result.error) {
                addMessage('Modron Alpha', result.error, true);
            } else if (result) {
                addMessage('Modron Alpha', '', true, result);
            } else {
                addMessage('Modron Alpha', 'Comando inválido. Use formatos como "d20", "2d6+3" ou comandos slash como "/criar_inventario".', true);
            }
        } else {
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('ragnar') || lowerMessage.includes('bárbaro')) {
                const ragnar = getNPCByName('Ragnar');
                addMessage(ragnar.name, getRagnarResponse(message), false, null, ragnar);
            } else if (lowerMessage.includes('meredith') || lowerMessage.includes('curandeira')) {
                const meredith = getNPCByName('Meredith');
                addMessage(meredith.name, getMeredithResponse(message), false, null, meredith);
            } else if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('ola')) {
                addMessage('Modron Alpha', 'Olá! Use /comandos para ver todos os comandos disponíveis.', true);
            } else if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
                addMessage('Modron Alpha', 'Use "/comandos" para ver todos os comandos disponíveis!', true);
            } else {
                addMessage('Modron Alpha', 'Para rolar dados, use "d20" ou "2d6+3". Para inventário, use comandos como "/criar_inventario".', true);
            }
        }
    }, 500);
});

document.getElementById('toggleSlashPanel').addEventListener('click', function() {
    const panel = document.getElementById('slashCommandsPanel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', function(e) {
    const panel = document.getElementById('slashCommandsPanel');
    const toggle = document.getElementById('toggleSlashPanel');
    
    if (!panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.style.display = 'none';
    }
});
document.querySelectorAll('.slash-command-item').forEach(item => {
    item.addEventListener('click', function() {
        const command = this.getAttribute('data-command');
        document.getElementById('messageInput').value = command;
        document.getElementById('slashCommandsPanel').style.display = 'none';
        document.getElementById('messageInput').focus();
    });
});
document.querySelectorAll('.command-example, .dice-btn').forEach(button => {
    button.addEventListener('click', function() {
        const roll = this.getAttribute('data-roll');
        const command = this.getAttribute('data-command');
        
        if (roll) {
            document.getElementById('messageInput').value = roll;
        } else if (command) {
            document.getElementById('messageInput').value = command;
        }
        
        document.getElementById('messageInput').focus();
    });
});
document.getElementById('slashHint').addEventListener('click', function() {
    document.getElementById('messageInput').value = '/';
    document.getElementById('messageInput').focus();
    document.getElementById('slashCommandsPanel').style.display = 'block';
});

document.getElementById('messageInput').addEventListener('input', function() {
    if (this.value === '/') {
        document.getElementById('slashCommandsPanel').style.display = 'block';
    }
});

inventorySystem.updateInventoryDisplay();

setTimeout(() => {
    const ragnar = getNPCByName('Ragnar');
    addMessage(ragnar.name, '/adicionar_item Machado Grande 1 Um machado de batalha gigante', false, null, ragnar);
    
    setTimeout(() => {
        addMessage('Modron Alpha', '✅ Adicionado 1x Machado Grande ao inventário!', true);
        
        setTimeout(() => {
            const meredith = getNPCByName('Meredith');
            addMessage(meredith.name, '/adicionar_ouro 100', false, null, meredith);
            
            setTimeout(() => {
                addMessage('Modron Alpha', '✅ Adicionado 100 moedas de ouro ao inventário!', true, "result2");
            }, 800);
        }, 1000);
    }, 800);
}, 1500);