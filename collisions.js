// Importar o THREE para usar métodos de vetor
// import * as THREE from 'three'; // Se usar classes ou métodos do THREE aqui

// Mover o corpo completo da função checkCollisions para cá
// Precisará receber celestialObjects e scene como parâmetros
export function checkCollisions(celestialObjects, scene, updateObjectSelectCallback, setSelectedObjectCallback, setSelectedObjectControlsDisplayCallback) {
    // A lógica de detecção de colisão atual (planeta vs estrela)
    // TODO: Adaptar se necessário para colisões estrela-estrela ou planeta-planeta
    for (let i = celestialObjects.length - 1; i >= 0; i--) {
        const object = celestialObjects[i];
        if (object.type === 'planet') { // Esta condição pode precisar ser generalizada ou adaptada
             for (let j = 0; j < celestialObjects.length; j++) {
                 const otherObject = celestialObjects[j];
                 if (otherObject.type === 'star') { // Esta condição também pode mudar
                     const distance = object.position.distanceTo(otherObject.position);

                     if (distance < object.radius + otherObject.radius) {
                         console.log(`${object.name} colidiu com ${otherObject.name}. Removendo.`);
                         // Remover do Three.js (precisa da referência da cena)
                         scene.remove(object.mesh);
                         // Remover do array de objetos (o array é gerenciado externamente, talvez em main.js)
                         // Precisará de uma forma de notificar main.js ou remover diretamente
                         celestialObjects.splice(i, 1);

                         // Atualizar UI (precisa de callbacks para funções em ui.js)
                         if(updateObjectSelectCallback) updateObjectSelectCallback();
                         // Se o objeto colidido era o selecionado (precisa de acesso ou callback)
                         // if (selectedObject && selectedObject.id === object.id) {
                         //    setSelectedObjectCallback(null);
                         //    setSelectedObjectControlsDisplayCallback('none');
                         // }

                         break; // Sai do loop de outros objetos para este objeto colidido
                     }
                 }
             }
        }
    }
     // Nota: Remover itens de um array que está sendo iterado pode ser tricky (loop de trás para frente é uma solução)
     // Passar celestialObjects, scene, e callbacks para UI como parâmetros é uma boa prática.
}