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
            <div v-for="(card, index) in column" :key="index" class="card" @dblclick="openModal(card, colIndex, index)">
              <h3>{{ card.title || 'Без названия' }}</h3>
              <p>{{ card.description || 'Нет описания' }}</p>
              <p><strong>Дедлайн:</strong> {{ card.deadline || 'Не установлен' }}</p>
              <p><strong>Создано:</strong> {{ card.createdAt }}</p>
              <p><strong>Последнее изменение:</strong> {{ card.updatedAt || 'Не изменялось' }}</p>
            </div>
          </div>
        </div>

        <!-- Модальное окно редактирования карточки -->
        <div v-if="isModalOpen" class="modal">
          <div class="modal-content">
            <h2>Редактировать карточку</h2>
            <label>Заголовок: <input v-model="currentEditingCard.title" type="text"></label>
            <label>Описание: <textarea v-model="currentEditingCard.description"></textarea></label>
            <label>Дедлайн: <input v-model="currentEditingCard.deadline" type="date"></label>
            <div class="modal-buttons">
              <button @click="saveCard">Сохранить</button>
              <button @click="deleteCard">Удалить</button>
              <button @click="closeModal">Закрыть</button>
            </div>
          </div>
        </div>
      </div>
    `,
    data: {
        columns: [[], [], [], []], // 4 столбца
        columnTitles: ["Запланированные задачи", "В работе", "Тестирование", "Выполненные задачи"],
        isModalOpen: false,
        currentEditingCard: null,
        currentColumnIndex: null,
        currentCardIndex: null
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
                updatedAt: null, // Поле последнего изменения
            };

            if (!this.isColumn1Blocked) {
                this.columns[0].push(newCard);
                this.openModal(newCard, 0, this.columns[0].length - 1);
            } else {
                console.warn("Максимум 3 карточки!");
            }
        },

        openModal(card, columnIndex, cardIndex) {
            this.currentEditingCard = { ...card }; // Создаем копию объекта для редактирования
            this.currentColumnIndex = columnIndex;
            this.currentCardIndex = cardIndex;
            this.isModalOpen = true;
        },

        saveCard() {
            if (this.currentEditingCard && this.currentColumnIndex !== null && this.currentCardIndex !== null) {
                this.currentEditingCard.updatedAt = new Date().toLocaleString(); // Обновляем время изменения
                this.$set(this.columns[this.currentColumnIndex], this.currentCardIndex, { ...this.currentEditingCard });
                this.closeModal();
            }
        },

        deleteCard() {
            if (this.currentColumnIndex !== null && this.currentCardIndex !== null) {
                this.columns[this.currentColumnIndex].splice(this.currentCardIndex, 1);
                this.closeModal();
            }
        },

        closeModal() {
            this.isModalOpen = false;
            this.currentEditingCard = null;
            this.currentColumnIndex = null;
            this.currentCardIndex = null;
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
