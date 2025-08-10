// src/utils/professionalSearch.js

/**
 * =================================================================================
 * CÓDIGO DE PESQUISA DE PROFISSIONAIS - NÃO ALTERAR A LÓGICA DE ORDENAÇÃO
 * =================================================================================
 * A fórmula de pontuação para a pesquisa por habilidade é:
 * score = (prioridade do profissional) + (rating da habilidade * 2)
 *
 * Desempate:
 * 1. Em caso de pontuações (scores) iguais, o profissional com MAIOR RATING
 * na habilidade pesquisada terá preferência.
 * 2. Se o rating também for igual, a ordenação é alfabética.
 * =================================================================================
 */

/**
 * Pesquisa e ordena profissionais com base num termo de pesquisa, que pode ser um nome ou uma habilidade.
 * @param {object} options - As opções para a pesquisa.
 * @param {string} options.searchTerm - O termo a ser pesquisado.
 * @param {Array} options.allProfessionals - A lista de todos os profissionais.
 * @param {Array} options.allSkills - A lista de todas as habilidades.
 * @param {function} options.getSkillName - Função para obter o nome de uma habilidade pelo ID.
 * @param {function} [options.checkAvailability=null] - Função opcional para verificar a disponibilidade.
 * @param {Object} [options.interval=null] - Intervalo opcional {start, end} para verificação de disponibilidade.
 * @returns {Array} - Uma lista ordenada e única de profissionais que correspondem à pesquisa.
 */
export const searchAndSortProfessionals = ({
    searchTerm,
    allProfessionals,
    allSkills,
    getSkillName,
    checkAvailability = null,
    interval = null
}) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (lowerCaseSearchTerm.length < 2) return [];

    const skillNames = (allSkills || []).map(s => s.name.toLowerCase());
    const isSkillSearch = skillNames.some(name => lowerCaseSearchTerm.includes(name));

    const professionalsWithStatus = (allProfessionals || []).flatMap(p => {
        const availability = checkAvailability && interval 
            ? checkAvailability(p.name, 'professional', interval) 
            : { status: 'available' };
            
        const results = [];
        const nameMatch = p.name.toLowerCase().includes(lowerCaseSearchTerm);
        const matchingSkills = p.skills?.filter(skill => getSkillName(skill.id).toLowerCase().includes(lowerCaseSearchTerm)) || [];

        // Adiciona se o nome corresponder
        if (nameMatch) {
            const representativeSkill = p.skills && p.skills.length > 0 ? p.skills[0] : { id: null, rating: 0 };
            const skillName = getSkillName(representativeSkill.id);
            results.push({
                ...p, // Retorna o objeto profissional completo
                idWithSkill: `${p.id}-${representativeSkill.id}`,
                displayName: skillName !== 'N/A' ? `${p.name} (${skillName})` : p.name,
                selectedSkillId: representativeSkill.id,
                skillRating: representativeSkill.rating,
                availability,
                matchType: 'name',
                score: p.priority || 0 // Pontuação base para nome é a prioridade
            });
        }

        // Adiciona para cada habilidade correspondente
        if (matchingSkills.length > 0) {
            matchingSkills.forEach(skill => {
                const score = (p.priority || 0) + ((skill.rating || 0) * 2); // Fórmula de pontuação
                const skillName = getSkillName(skill.id);
                results.push({
                    ...p, // Retorna o objeto profissional completo
                    idWithSkill: `${p.id}-${skill.id}`,
                    displayName: `${p.name} (${skillName})`,
                    selectedSkillId: skill.id,
                    skillRating: skill.rating, // Guarda o rating da habilidade para desempate
                    availability,
                    matchType: 'skill',
                    score
                });
            });
        }
        return results;
    });

    const uniqueResultsMap = new Map();
    professionalsWithStatus.forEach(p => {
        const existing = uniqueResultsMap.get(p.displayName);
        // Prioriza a entrada de 'skill' sobre 'name' ou a com maior pontuação
        if (!existing || p.score > existing.score) {
            uniqueResultsMap.set(p.displayName, p);
        }
    });
    
    const uniqueResults = Array.from(uniqueResultsMap.values());

    // Ordenação com lógica de desempate
    uniqueResults.sort((a, b) => {
        if (isSkillSearch) {
            // 1. Ordenar por pontuação (maior primeiro)
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // 2. Desempate por rating da habilidade (maior primeiro)
            if (b.skillRating !== a.skillRating) {
                return b.skillRating - a.skillRating;
            }
        }
        // 3. Desempate final por nome (alfabético)
        return a.displayName.localeCompare(b.displayName);
    });

    return uniqueResults;
};