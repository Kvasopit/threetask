new Vue({
    el: "#app",
    template: `
      <div>
        <button @click="addCard" class="add-card-clear-btn">
          Добавить карточку
        </button>
        <button @click="clearStorage" class="add-card-clear-btn">
          Очистить Доску
        </button>

        <div class="columns">
          <div
              class="column"
              v-for="(column, colIndex) in columns"
              :key="colIndex"
              @dragover="onDragOver($event, colIndex)"
              @drop="onDrop(colIndex, $event)"
          >
            <h2>{{ columnTitles[colIndex] }}</h2>
            <div
                v-for="(card, index) in column"
                :key="index"
                class="card"
                @dragstart="onDragStart(colIndex, index, $event)"
                :draggable="colIndex === 0 || colIndex === 1 || colIndex === 2"
            >
              <h3>{{ card.title || 'Без названия' }}</h3>
              <p>{{ card.description || 'Нет описания' }}</p>
              <p><strong>Дедлайн:</strong> {{ card.deadline || 'Не установлен' }}</p>
              <p><strong>Создано:</strong> {{ card.createdAt }}</p>
              <p><strong>Последнее изменение:</strong> {{ card.updatedAt || 'Не изменялось' }}</p>
              <!-- Отображаем причину возврата, если она есть -->
              <p v-if="card.returnReason"><strong>Причина возврата:</strong> {{ card.returnReason }}</p>
              <!-- Отображаем статус выполнения, если карточка в четвёртом столбце -->
              <p v-if="colIndex === 3 && card.status">
                <strong>Статус:</strong>
                <span :class="{'status-overdue': card.status === 'overdue', 'status-completed': card.status === 'completedOnTime'}">
            {{ card.status === "overdue" ? "Просрочено" : "Выполнено в срок" }}
        </span>
              </p>
              <!-- Кнопка "Редактировать карточку" отображается только в первых трёх столбцах -->
              <button
                  v-if="colIndex !== 3"
                  @click="openModal(card, colIndex, index)"
                  class="edit-card-btn"
              >
                Редактировать карточку
              </button>
            </div>
          </div>
        </div>

        <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <h2>Редактировать карточку</h2>
            <label>Заголовок:</label>
            <input v-model="currentEditingCard.title" type="text" class="modal-input">
            <label>Описание:</label>
            <textarea v-model="currentEditingCard.description" class="modal-input"></textarea>
            <label>Дедлайн:</label>
            <input v-model="currentEditingCard.deadline" type="date" class="modal-input">
            <div class="modal-buttons">
              <button @click="saveCard" class="btn btn-save">Сохранить</button>
              <button @click="deleteCard" class="btn btn-delete">Удалить</button>
              <button @click="closeModal" class="btn btn-close">Закрыть</button>
            </div>
          </div>
        </div>

        <div v-if="isActionModalOpen" class="action-modal-overlay" @click.self="closeModal">
          <div class="action-modal-content">
            <h2>Выберите действие</h2>
            <div class="action-modal-buttons">
              <button @click="moveToCompleted" class="btn btn-move">Переместить в "Выполненные задачи"</button>
              <button @click="showReturnReasonInput" class="btn btn-return">Вернуть в "В работу"</button>
              <button @click="closeActionModal" class="btn btn-close">Закрыть</button>
            </div>
          </div>
        </div>

        <div v-if="isReturnReasonModalOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content">
            <h2>Укажите причину возврата</h2>
            <textarea v-model="returnReason" placeholder="Введите причину возврата" class="modal-input"></textarea>
            <div class="modal-buttons">
              <button @click="moveBackToInProgress" class="btn btn-save">Подтвердить</button>
              <button @click="closeReturnReasonModal" class="btn btn-close">Отмена</button>
            </div>
          </div>
        </div>
      </div>
    `,
    data: {
        columns: [[], [], [], []],
        columnTitles: ["Запланированные задачи", "В работе", "Тестирование", "Выполненные задачи"],
        isModalOpen: false,
        isActionModalOpen: false,
        isReturnReasonModalOpen: false,
        currentEditingCard: null,
        currentColumnIndex: null,
        currentCardIndex: null,
        draggedCard: null,
        draggedColumnIndex: null,
        returnReason: "", // Причина возврата
    },
    methods: {
        addCard() {
            let newCard = {
                title: "",
                description: "",
                deadline: null,
                createdAt: new Date().toLocaleString(),
                updatedAt: null,
                returnReason: "", // Добавляем поле для причины возврата
            };
            this.columns[0].push(newCard);
            this.openModal(newCard, 0, this.columns[0].length - 1);
        },

        openModal(card, columnIndex, cardIndex) {
            if (columnIndex === 3) {
                return; // Запрещаем редактирование в четвёртом столбце
            }
            this.currentEditingCard = { ...card };
            this.currentColumnIndex = columnIndex;
            this.currentCardIndex = cardIndex;
            this.isModalOpen = true;
        },

        saveCard() {
            if (this.currentEditingCard && this.currentColumnIndex !== null && this.currentCardIndex !== null) {
                this.currentEditingCard.updatedAt = new Date().toLocaleString();
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

        onDragStart(colIndex, cardIndex, event) {
            this.draggedCard = this.columns[colIndex][cardIndex];
            this.draggedColumnIndex = colIndex;
            event.dataTransfer.effectAllowed = "move";
            event.target.classList.add("dragging");
        },

        onDragOver(event, colIndex) {
            event.preventDefault();
        },

        onDrop(colIndex, event) {
            event.preventDefault();

            if (this.draggedCard && this.draggedColumnIndex !== null) {
                // Проверяем, можно ли переместить карточку в целевой столбец
                if (
                    (this.draggedColumnIndex === 0 && colIndex === 1) || // Из 1 в 2
                    (this.draggedColumnIndex === 1 && (colIndex === 0 || colIndex === 2)) || // Из 2 в 1 или 3
                    (this.draggedColumnIndex === 2 && (colIndex === 1 || colIndex === 3)) // Из 3 в 2 или 4
                ) {
                    if (this.draggedColumnIndex === 2 && colIndex === 3) {
                        this.isActionModalOpen = true;
                    } else {
                        this.moveCard(colIndex);
                    }
                }
            }
        },

        moveCard(colIndex) {
            const cardIndexInDraggedColumn = this.columns[this.draggedColumnIndex].indexOf(this.draggedCard);
            if (cardIndexInDraggedColumn > -1) {
                this.columns[this.draggedColumnIndex].splice(cardIndexInDraggedColumn, 1);
            }
            this.columns[colIndex].push(this.draggedCard);
            this.draggedCard = null;
            this.draggedColumnIndex = null;
        },

        showReturnReasonInput() {
            this.isActionModalOpen = false;
            this.isReturnReasonModalOpen = true;
        },

        moveBackToInProgress() {
            if (this.returnReason) {
                this.draggedCard.returnReason = this.returnReason; // Сохраняем причину возврата
                this.moveCard(1);
                this.returnReason = ""; // Очищаем поле причины
                this.closeReturnReasonModal();
            }
        },
        moveToCompleted() {
            if (this.draggedCard) {
                // Проверяем срок дедлайна
                const currentDate = new Date();
                const deadlineDate = new Date(this.draggedCard.deadline);

                if (deadlineDate < currentDate) {
                    // Если дедлайн просрочен
                    this.draggedCard.status = "overdue"; // Просрочено
                } else {
                    // Если дедлайн не просрочен
                    this.draggedCard.status = "completedOnTime"; // Выполнено в срок
                }

                // Перемещаем карточку в столбец "Выполненные задачи"
                this.moveCard(3);
                this.closeActionModal();
            }
        },

        closeActionModal() {
            this.isActionModalOpen = false;
        },

        closeReturnReasonModal() {
            this.isReturnReasonModalOpen = false;
        },

        clearStorage() {
            localStorage.clear();
            this.columns = [[], [], [], []];
        },

        handleKeydown(event) {
            if (event.key === "Escape") {
                if (this.isModalOpen) {
                    this.closeModal();
                } else if (this.isActionModalOpen) {
                    this.closeActionModal();
                } else if (this.isReturnReasonModalOpen) {
                    this.closeReturnReasonModal();
                }
            }
        },
    },

    mounted() {
        // Добавляем обработчик события keydown при монтировании компонента
        document.addEventListener("keydown", this.handleKeydown);

        const savedData = localStorage.getItem("notes");
        if (savedData) {
            this.columns = JSON.parse(savedData);
        }
    },

    beforeDestroy() {
        // Удаляем обработчик события keydown при уничтожении компонента
        document.removeEventListener("keydown", this.handleKeydown);
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
