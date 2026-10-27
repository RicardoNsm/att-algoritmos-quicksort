# QuickSort — apresentação interativa

Apresentação em português sobre o algoritmo QuickSort, feita com HTML, CSS e JavaScript sem dependências de instalação.

## Como apresentar

1. Abra `index.html` em um navegador atualizado. Também é possível usar a extensão Live Server no VS Code.
2. Siga as seções na ordem: conceito, complexidade, animação, código e comparação.
3. Na animação, use **Próximo** para explicar cada comparação e troca, **Iniciar** para demonstrar a ordenação e **Anterior** para rever uma etapa.
4. Altere o vetor para mostrar outro exemplo. São aceitos de 2 a 20 números inteiros, separados por vírgula ou espaço, entre −999 e 999.

## Roteiro sugerido (10–15 minutos)

- **1–2 min — Ideia:** explique pivô, partição e a estratégia “dividir para conquistar”.
- **2–3 min — Exemplo:** use os controles da animação para percorrer o vetor `[8, 3, 7, 5, 2, 9, 1]`.
- **2–3 min — Código:** apresente a condição de parada, o particionamento de Lomuto e as chamadas recursivas.
- **2 min — Análise:** compare melhor caso e caso médio O(n log n) com o pior caso O(n²); explique a pilha recursiva e estabilidade.
- **2–3 min — Comparação e conclusão:** use a tabela para discutir quando QuickSort, Merge Sort ou um algoritmo simples é apropriado.

## Implementação apresentada

O exemplo utiliza JavaScript e particionamento de Lomuto: o pivô é o último elemento do trecho, e cada valor menor ou igual ao pivô é movido para a região à esquerda. O pivô é então colocado em sua posição definitiva, e o processo continua recursivamente nos dois trechos restantes.

## Limitações didáticas

Esta demonstração escolhe sempre o último elemento como pivô para tornar os passos previsíveis. Com entradas já ordenadas ou ordenadas em sentido inverso, essa escolha pode provocar o pior caso O(n²). Implementações de produção podem escolher o pivô aleatoriamente ou usar outras estratégias para reduzir esse risco.
