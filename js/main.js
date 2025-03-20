new Vue({
    el: "#app",
    template: `
    <div>
      <!-- Кнопки управления -->
      <button @click="addCard" :disabled="isColumn1Blocked" class="add-card-clear-btn">
        Добавить карточку
      </button>
      <button @click="clearStorage" class="add-card-clear-btn">
        Очистить Ежедневник
      </button>
      <p v-if="isColumn1Blocked" class="warning">
        Первый столбец заблокирован для редактирования
      </p>

      <div class="columns">
        <!-- 1-й столбец -->
        <div class="column">
          <h2>Новые</h2>
          <div v-for="(card, index) in columns[0]" :key="index" class="card">
            <div class="card-title">
              <template v-if="!card.isEditingTitle">
                <h3 @dblclick="editCardTitle(card)">{{ card.title }}</h3>
              </template>
              <template v-else>
                <input type="text" v-model="card.title"
                       @blur="saveCardTitle(card)" @keyup.enter="saveCardTitle(card)" />
              </template>
            </div>
            <ul class="task-list">
              <li v-for="(task, tIndex) in card.tasks" :key="tIndex">
                <input type="checkbox" v-model="task.done" @change="updateProgress(card)" />
                <template v-if="!task.isEditing">
                  <span @dblclick="editTask(task)">{{ task.text }}</span>
                </template>
                <template v-else>
                  <input type="text" v-model="task.text"
                         @blur="saveTask(task)" @keyup.enter="saveTask(task)" />
                </template>
              </li>
            </ul>
            <button @click="addTask(card)" :disabled="isColumn1Blocked" class="add-task-btn">
              Добавить пункт
            </button>
          </div>
        </div>

        <!-- 2-й столбец -->
        <div class="column">
          <h2>В процессе</h2>
          <div v-for="(card, index) in columns[1]" :key="index" class="card">
            <div class="card-title">
              <template v-if="!card.isEditingTitle">
                <h3 @dblclick="editCardTitle(card)">{{ card.title }}</h3>
              </template>
              <template v-else>
                <input type="text" v-model="card.title"
                       @blur="saveCardTitle(card)" @keyup.enter="saveCardTitle(card)" />
              </template>
            </div>
            <ul class="task-list">
              <li v-for="(task, tIndex) in card.tasks" :key="tIndex">
                <input type="checkbox" v-model="task.done" @change="updateProgress(card)" />
                <template v-if="!task.isEditing">
                  <span @dblclick="editTask(task)">{{ task.text }}</span>
                </template>
                <template v-else>
                  <input type="text" v-model="task.text"
                         @blur="saveTask(task)" @keyup.enter="saveTask(task)" />
                </template>
              </li>
            </ul>
          </div>
        </div>

        <!-- 3-й столбец -->
        <div class="column">
          <h2>Готово</h2>
          <div v-for="(card, index) in columns[2]" :key="index" class="card">
            <div class="card-title">
              <!-- В третьем столбце редактирование отключено -->
              <h3>{{ card.title }}</h3>
            </div>
            <p class="completed-date">Завершено: {{ card.completedAt }}</p>
            <ul class="task-list">
              <li v-for="(task, tIndex) in card.tasks" :key="tIndex">
                {{ task.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
    data: {
        columns: [
            [], // 1-й столбец (Новые)
            [], // 2-й столбец (В процессе)
            []  // 3-й столбец (Готово)
        ]
    },
    computed: {
        // Блокировка первого столбца, если во втором уже 5 карточек и есть карточка в первом с прогрессом >50%
        isColumn1Blocked() {
            const secondColFull = this.columns[1].length >= 5;
            const hasHalfDone = this.columns[0].some(card => card.completed > 50);
            return secondColFull && hasHalfDone;
        }
    },
    methods: {
        addCard() {
            if (this.isColumn1Blocked) {
                console.warn("Первый столбец заблокирован для редактирования!");
                return;
            }

            let newCard = {
                title: "Новая заметка",
                tasks: [
                    { text: "Задача 1", done: false },
                    { text: "Задача 2", done: false },
                    { text: "Задача 3", done: false }
                ],
                completed: 0,
                completedAt: null,
                isEditingTitle: false
            };

            if (this.columns[0].length < 3) {
                this.columns[0].push(newCard);
                console.log("Карточка добавлена:", newCard);
            } else {
                console.warn("Максимум 3 карточки в первой колонке!");
            }
        },

        addTask(card) {
            if (this.isColumn1Blocked) {
                console.warn("Первый столбец заблокирован для редактирования!");
                return;
            }

            if (card.tasks.length < 5) {
                let newTask = { text: "Новый пункт", done: false, isEditing: false };
                card.tasks.push(newTask);
                console.log("Добавлен пункт:", newTask, "в карточку", card.title);
            } else {
                console.warn("Максимум 5 пунктов в одной карточке!");
            }
        },

        updateProgress(card) {
            let completedTasks = card.tasks.filter(task => task.done).length;
            let totalTasks = card.tasks.length;
            card.completed = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            console.log(`Прогресс карточки "${card.title}": ${card.completed}%`);
            this.moveCard(card);
        },

        moveCard(card) {
            let columnIndex = this.columns.findIndex(col => col.includes(card));

            if (columnIndex === 0) {
                if (card.completed === 100) {
                    const idx = this.columns[0].indexOf(card);
                    if (idx !== -1) {
                        this.columns[0].splice(idx, 1);
                    }
                    card.completedAt = new Date().toLocaleString();
                    this.columns[2].push(card);
                    console.log(`Карточка "${card.title}" завершена и перемещена в "Готово"`);
                } else if (card.completed > 50) {
                    if (this.columns[1].length < 5) {
                        const idx = this.columns[0].indexOf(card);
                        if (idx !== -1) {
                            this.columns[0].splice(idx, 1);
                        }
                        this.columns[1].push(card);
                        console.log(`Карточка "${card.title}" перемещена в "В процессе"`);
                    } else {
                        console.warn("Вторая колонка заполнена, перемещение невозможно!");
                    }
                }
            }

            if (columnIndex === 1 && card.completed === 100) {
                const idx = this.columns[1].indexOf(card);
                if (idx !== -1) {
                    this.columns[1].splice(idx, 1);
                }
                card.completedAt = new Date().toLocaleString();
                this.columns[2].push(card);
                console.log(`Карточка "${card.title}" завершена и перемещена в "Готово"`);
            }
        },

        // Редактирование пункта задачи
        editTask(task) {
            this.$set(task, 'isEditing', true);
        },
        saveTask(task) {
            task.isEditing = false;
        },

        // Редактирование заголовка карточки
        editCardTitle(card) {
            this.$set(card, 'isEditingTitle', true);
        },
        saveCardTitle(card) {
            card.isEditingTitle = false;
        },

        clearStorage() {
            localStorage.clear();
            this.columns = [[], [], []];
            console.log("LocalStorage очищен");
        }
    },
    mounted() {
        const savedData = localStorage.getItem("notes");
        if (savedData) {
            this.columns = JSON.parse(savedData);
        }
    },
    watch: {
        columns: {
            deep: true,
            handler() {
                localStorage.setItem("notes", JSON.stringify(this.columns));
            }
        }
    }
});
