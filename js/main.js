new Vue({
    el: "#app",
    template: `
    <div>
      <button @click="addCard" :disabled="isColumn1Blocked" class="add-card-clear-btn">
        Добавить карточку
      </button>
      <button @click="clearStorage" class="add-card-clear-btn">
        Очистить Доску
      </button>
      <p v-if="isColumn1Blocked" class="warning">
        Первый столбец заблокирован для редактирования
      </p>

      <div class="columns">
        <div class="column" v-for="(column, colIndex) in columns" :key="colIndex">
          <h2>{{ columnTitles[colIndex] }}</h2>
          <div v-for="(card, index) in column" :key="index" class="card">
            <h3 @dblclick="openModal(card)">{{ card.title || 'Без названия' }}</h3>
            <p>{{ card.description || 'Нет описания' }}</p>
            <p><strong>Дедлайн:</strong> {{ card.deadline || 'Не установлен' }}</p>
            <p><strong>Создано:</strong> {{ card.createdAt }}</p>
          </div>
        </div>
      </div>

      <div v-if="isModalOpen" class="modal">
        <h2>Редактировать карточку</h2>
        <label>Заголовок: <input v-model="currentEditingCard.title" type="text"></label>
        <label>Описание: <textarea v-model="currentEditingCard.description"></textarea></label>
        <label>Дедлайн: <input v-model="currentEditingCard.deadline" type="date"></label>
        <button @click="closeModal">Сохранить</button>
      </div>
    </div>
  `,
    data: {
        columns: [[], [], [], []], // 4 столбца
        columnTitles: ["Запланированные задачи", "В работе", "Тестирование", "Выполненные задачи"],
        isModalOpen: false,
        currentEditingCard: null,
    },
    computed: {
        isColumn1Blocked() {
            return this.columns[0].length >= 3; // Блокировка после 3 карточек
        }
    },
    methods: {
        addCard() {
            let newCard = {
                title: "",
                description: "",
                deadline: null,
                createdAt: new Date().toLocaleString(),
            };

            if (!this.isColumn1Blocked) {
                this.columns[0].push(newCard);
                this.openModal(newCard);
            } else {
                console.warn("Максимум 3 карточки!");
            }
        },

        openModal(card) {
            this.currentEditingCard = card;
            this.isModalOpen = true;
        },

        closeModal() {
            this.isModalOpen = false;
            this.currentEditingCard = null;
        },

        clearStorage() {
            localStorage.clear();
            this.columns = [[], [], [], []];
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
