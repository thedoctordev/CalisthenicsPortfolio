class DataManager {
    constructor() {
        this.exercises = [];
        this.nutrition = [];
        this.routines = [];
        this.progressions = [];
        this.currentSection = 'exercises';
        this.loadData();
        this.initializeEventListeners();
    }

    async loadData() {
        try {
            // Carregar dados dos arquivos JSON
            const [exercisesResponse, nutritionResponse, routinesResponse, progressionsResponse] = await Promise.all([
                fetch('data/exercises.json'),
                fetch('data/nutrition.json'),
                fetch('data/routines.json'),
                fetch('data/progressions.json')
            ]);

            this.exercises = await exercisesResponse.json();
            this.nutrition = await nutritionResponse.json();
            this.routines = await routinesResponse.json();
            this.progressions = await progressionsResponse.json();

            // Exibir dados iniciais
            this.showSection('exercises');

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    initializeEventListeners() {
        // Menu hamburguer
        const menuBtn = document.getElementById('menuBtn');
        const mainNav = document.getElementById('mainNav');
        
        menuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });

        // Botões de navegação principal
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
                
                // Toggle submenu
                const submenu = e.currentTarget.nextElementSibling;
                const wasActive = submenu.classList.contains('active');
                
                // Fecha todos os submenus
                document.querySelectorAll('.submenu').forEach(sub => {
                    sub.classList.remove('active');
                });
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Abre o submenu clicado (se não estava ativo)
                if (!wasActive) {
                    submenu.classList.add('active');
                    e.currentTarget.classList.add('active');
                }

                // Se não tiver submenu ou se o submenu estava ativo, fecha o menu
                if (!submenu || wasActive) {
                    mainNav.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Links dos submenus
        const submenuLinks = document.querySelectorAll('.submenu a');
        submenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.filterContent(category);
                // Fechar o menu ao selecionar uma opção
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Busca
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        const handleSearch = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            this.searchContent(searchTerm);
            // Fechar o menu ao realizar uma busca
            mainNav.classList.remove('active');
            document.body.style.overflow = '';
        };

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }

    showSection(sectionName) {
        this.currentSection = sectionName;
        
        // Esconde todas as seções
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostra a seção selecionada
        const activeSection = document.getElementById(`${sectionName}Section`);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        // Atualiza o conteúdo
        this.updateContent();
    }

    updateContent() {
        switch (this.currentSection) {
            case 'exercises':
                this.displayExercises();
                break;
            case 'routines':
                this.displayRoutines();
                break;
            case 'nutrition':
                this.displayNutrition();
                break;
            case 'progressions':
                this.displayProgressions();
                break;
        }
    }

    filterContent(category) {
        if (category === 'todos') {
            this.updateContent();
            return;
        }

        switch (this.currentSection) {
            case 'exercises':
                this.displayExercises(item => item.category.toLowerCase() === category.toLowerCase());
                break;
            case 'routines':
                this.displayRoutines(item => item.category.toLowerCase() === category.toLowerCase());
                break;
            case 'nutrition':
                this.displayNutrition(item => item.category.toLowerCase() === category.toLowerCase());
                break;
            case 'progressions':
                this.displayProgressions(item => item.category.toLowerCase() === category.toLowerCase());
                break;
        }
    }

    searchContent(searchTerm) {
        if (!searchTerm) {
            this.updateContent();
            return;
        }

        const filterFn = item => {
            return Object.values(item).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm);
                }
                return false;
            });
        };

        switch (this.currentSection) {
            case 'exercises':
                this.displayExercises(filterFn);
                break;
            case 'routines':
                this.displayRoutines(filterFn);
                break;
            case 'nutrition':
                this.displayNutrition(filterFn);
                break;
            case 'progressions':
                this.displayProgressions(filterFn);
                break;
        }
    }

    displayExercises(filterFn = null) {
        const exercisesList = document.getElementById('exercisesList');
        if (!exercisesList) return;
        
        exercisesList.innerHTML = '';
        let exercises = this.exercises;

        if (filterFn) {
            exercises = exercises.filter(filterFn);
        }

        if (exercises.length === 0) {
            exercisesList.innerHTML = '<p class="no-results">Nenhum exercício encontrado.</p>';
            return;
        }

        exercises.forEach(exercise => {
            const card = document.createElement('div');
            card.className = 'card exercise-card';
            
            const imageUrl = exercise.media?.image || 'images/default-exercise.jpg';
            const videoUrl = exercise.media?.video || 'https://www.youtube.com/embed/GOj4TMPVuZg';

            card.innerHTML = `
                <div class="card-header">
                    <h3>${exercise.name}</h3>
                    <button class="expand-btn">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <p class="category">Categoria: ${exercise.category}</p>
                <div class="media-container">
                    <div class="image-view active">
                        <img src="${imageUrl}" alt="${exercise.name}" loading="lazy">
                    </div>
                    <div class="video-view">
                        <iframe 
                            width="100%" 
                            height="200" 
                            src="${videoUrl}" 
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                    <button class="toggle-media-btn">
                        <i class="fas fa-play-circle"></i>
                    </button>
                </div>
                <div class="details-content">
                    <p>${exercise.description}</p>
                    <div class="muscles">
                        <strong>Músculos:</strong> ${exercise.muscles.join(', ')}
                    </div>
                    <div class="instructions">
                        <strong>Instruções:</strong>
                        <ul>
                            ${exercise.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;

            this.addExpandListener(card);
            // Adicionar event listener para o botão de toggle
            const toggleBtn = card.querySelector('.toggle-media-btn');
            const mediaContainer = card.querySelector('.media-container');
            const imageView = mediaContainer.querySelector('.image-view');
            const videoView = mediaContainer.querySelector('.video-view');

            toggleBtn.addEventListener('click', () => {
                const icon = toggleBtn.querySelector('i');
                if (imageView.classList.contains('active')) {
                    imageView.classList.remove('active');
                    videoView.classList.add('active');
                    icon.classList.remove('fa-play-circle');
                    icon.classList.add('fa-image');
                } else {
                    videoView.classList.remove('active');
                    imageView.classList.add('active');
                    icon.classList.remove('fa-image');
                    icon.classList.add('fa-play-circle');
                }
            });

            exercisesList.appendChild(card);
        });
    }

    displayRoutines(filterFn = null) {
        const routinesList = document.getElementById('routinesList');
        if (!routinesList) return;
        
        routinesList.innerHTML = '';
        let routines = this.routines;

        if (filterFn) {
            routines = routines.filter(filterFn);
        }

        if (routines.length === 0) {
            routinesList.innerHTML = '<p class="no-results">Nenhuma rotina encontrada.</p>';
            return;
        }

        routines.forEach(routine => {
            const card = document.createElement('div');
            card.className = 'card routine-card';

            const imageUrl = routine.media?.image || 'images/default-routine.jpg';
            const videoUrl = routine.media?.video || 'https://www.youtube.com/embed/GOj4TMPVuZg';

            const exercises = routine.exercises.map(exercise => {
                const exerciseImageUrl = exercise.media?.image || 'images/default-exercise.jpg';
                return `
                    <div class="routine-exercise">
                        <img src="${exerciseImageUrl}" alt="${exercise.name}" class="exercise-thumbnail">
                        <div class="exercise-details">
                            <strong>${exercise.name}</strong><br>
                            ${exercise.sets}x${exercise.reps} (Descanso: ${exercise.rest})
                        </div>
                    </div>
                `;
            }).join('');

            const tips = Array.isArray(routine.tips) 
                ? routine.tips.map(tip => `<li>${tip}</li>`).join('')
                : '';

            card.innerHTML = `
                <div class="card-header">
                    <h3>${routine.name}</h3>
                    <button class="expand-btn">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <p class="category">Nível: ${routine.category}</p>
                <div class="media-container">
                    <div class="image-view active">
                        <img src="${imageUrl}" alt="${routine.name}" loading="lazy">
                    </div>
                    <div class="video-view">
                        <iframe 
                            width="100%" 
                            height="200" 
                            src="${videoUrl}" 
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                    <button class="toggle-media-btn">
                        <i class="fas fa-play-circle"></i>
                    </button>
                </div>
                <div class="details-content">
                    <p class="details">
                        <span>Frequência: ${routine.frequency}</span> | 
                        <span>Duração: ${routine.duration}</span>
                    </p>
                    <p>${routine.description}</p>
                    <div class="exercises-list">
                        <strong>Exercícios:</strong>
                        <div class="routine-exercises-grid">
                            ${exercises}
                        </div>
                    </div>
                    ${tips ? `
                        <div class="tips">
                            <strong>Dicas:</strong>
                            <ul>${tips}</ul>
                        </div>
                    ` : ''}
                </div>
            `;

            this.addExpandListener(card);
            // Adicionar event listener para o botão de toggle
            const toggleBtn = card.querySelector('.toggle-media-btn');
            const mediaContainer = card.querySelector('.media-container');
            const imageView = mediaContainer.querySelector('.image-view');
            const videoView = mediaContainer.querySelector('.video-view');

            toggleBtn.addEventListener('click', () => {
                const icon = toggleBtn.querySelector('i');
                if (imageView.classList.contains('active')) {
                    imageView.classList.remove('active');
                    videoView.classList.add('active');
                    icon.classList.remove('fa-play-circle');
                    icon.classList.add('fa-image');
                } else {
                    videoView.classList.remove('active');
                    imageView.classList.add('active');
                    icon.classList.remove('fa-image');
                    icon.classList.add('fa-play-circle');
                }
            });

            routinesList.appendChild(card);
        });
    }

    displayNutrition(filterFn = null) {
        const nutritionList = document.getElementById('nutritionList');
        if (!nutritionList) return;
        
        nutritionList.innerHTML = '';
        let items = this.nutrition;

        if (filterFn) {
            items = items.filter(filterFn);
        }

        if (items.length === 0) {
            nutritionList.innerHTML = '<p class="no-results">Nenhum item nutricional encontrado.</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card nutrition-card';
            const nutrients = item.nutrients || {};

            const imageUrl = item.media?.image || 'images/default-nutrition.jpg';
            const videoUrl = item.media?.video || 'https://www.youtube.com/embed/GOj4TMPVuZg';

            card.innerHTML = `
                <div class="card-header">
                    <h3>${item.name}</h3>
                    <button class="expand-btn">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <p class="category">Categoria: ${item.category}</p>
                <div class="media-container">
                    <div class="image-view active">
                        <img src="${imageUrl}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="video-view">
                        <iframe 
                            width="100%" 
                            height="200" 
                            src="${videoUrl}" 
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen
                            loading="lazy">
                        </iframe>
                    </div>
                    <button class="toggle-media-btn">
                        <i class="fas fa-play-circle"></i>
                    </button>
                </div>
                <div class="details-content">
                    <p>Porção: ${item.portion}</p>
                    <div class="nutrients">
                        <strong>Informação Nutricional:</strong>
                        <ul>
                            <li>Calorias: ${nutrients.calorias ?? 0} kcal</li>
                            <li>Proteínas: ${nutrients.proteinas ?? 0}g</li>
                            <li>Carboidratos: ${nutrients.carboidratos ?? 0}g</li>
                            <li>Gorduras: ${nutrients.gorduras ?? 0}g</li>
                            <li>Fibras: ${nutrients.fibras ?? 0}g</li>
                        </ul>
                    </div>
                </div>
            `;

            this.addExpandListener(card);
            // Adicionar event listener para o botão de toggle
            const toggleBtn = card.querySelector('.toggle-media-btn');
            const mediaContainer = card.querySelector('.media-container');
            const imageView = mediaContainer.querySelector('.image-view');
            const videoView = mediaContainer.querySelector('.video-view');

            toggleBtn.addEventListener('click', () => {
                const icon = toggleBtn.querySelector('i');
                if (imageView.classList.contains('active')) {
                    imageView.classList.remove('active');
                    videoView.classList.add('active');
                    icon.classList.remove('fa-play-circle');
                    icon.classList.add('fa-image');
                } else {
                    videoView.classList.remove('active');
                    imageView.classList.add('active');
                    icon.classList.remove('fa-image');
                    icon.classList.add('fa-play-circle');
                }
            });

            nutritionList.appendChild(card);
        });
    }

    displayProgressions(filterFn = null) {
        const progressionsList = document.getElementById('progressionsList');
        if (!progressionsList) return;
        
        progressionsList.innerHTML = '';
        let progressions = this.progressions;

        if (filterFn) {
            progressions = progressions.filter(filterFn);
        }

        if (progressions.length === 0) {
            progressionsList.innerHTML = '<p class="no-results">Nenhuma progressão encontrada.</p>';
            return;
        }

        progressions.forEach(progression => {
            const card = document.createElement('div');
            card.className = 'card progression-card';

            const levels = progression.levels.map(level => {
                // Usar imagem padrão se não houver mídia específica
                const imageUrl = level.media?.image || 'images/default-exercise.jpg';
                const videoUrl = level.media?.video || 'https://www.youtube.com/embed/GOj4TMPVuZg';

                return `
                    <div class="level">
                        <div class="level-header">
                            <h4>Nível ${level.level}: ${level.name}</h4>
                            <button class="toggle-media-btn" data-level="${level.level}">
                                <i class="fas fa-play-circle"></i>
                            </button>
                        </div>
                        <div class="media-container" data-level="${level.level}">
                            <div class="image-view active">
                                <img src="${imageUrl}" alt="${level.name}" loading="lazy">
                            </div>
                            <div class="video-view">
                                <iframe 
                                    width="100%" 
                                    height="200" 
                                    src="${videoUrl}" 
                                    title="YouTube video player" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen
                                    loading="lazy">
                                </iframe>
                            </div>
                        </div>
                        <p>${level.description}</p>
                        <div class="level-details">
                            <span>${level.sets} séries de ${level.reps} repetições</span>
                        </div>
                        <div class="tips">
                            <strong>Dicas:</strong>
                            <ul>
                                ${level.tips.map(tip => `<li>${tip}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="criteria">
                            <strong>Critério para próximo nível:</strong>
                            <p>${level.criteria}</p>
                        </div>
                    </div>
                `;
            }).join('');

            card.innerHTML = `
                <div class="card-header">
                    <h3>${progression.name}</h3>
                    <button class="expand-btn">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <p class="category">Categoria: ${progression.category}</p>
                <div class="media-container">
                    ${levels}
                </div>
            `;

            this.addExpandListener(card);
            // Adicionar event listeners para os botões de toggle
            card.querySelectorAll('.toggle-media-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const level = btn.dataset.level;
                    const mediaContainer = card.querySelector(`.media-container[data-level="${level}"]`);
                    const imageView = mediaContainer.querySelector('.image-view');
                    const videoView = mediaContainer.querySelector('.video-view');
                    const icon = btn.querySelector('i');

                    if (imageView.classList.contains('active')) {
                        imageView.classList.remove('active');
                        videoView.classList.add('active');
                        icon.classList.remove('fa-play-circle');
                        icon.classList.add('fa-image');
                    } else {
                        videoView.classList.remove('active');
                        imageView.classList.add('active');
                        icon.classList.remove('fa-image');
                        icon.classList.add('fa-play-circle');
                    }
                });
            });

            progressionsList.appendChild(card);
        });
    }

    addExpandListener(card) {
        const header = card.querySelector('.card-header');
        header.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    }
}

// Inicializar o gerenciador de dados quando a página carregar
const dataManager = new DataManager();
