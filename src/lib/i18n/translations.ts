export const translations = {
  ru: {
    dashboard: 'Дашборд',
    analytics: {
      title: 'Аналитика',
      description: 'Управляйте путями развития, этапами и навыками.',
      stats: {
        totalCandidates: "Всего кандидатов",
        avgTime: "Среднее время",
        offerAcceptance: "Принятие офферов",
        positionsFilled: "Закрытые позиции",
        days: "дней"
      },
      vacancyStatus: {
        open: "Открытые",
        pending: "В ожидании",
        closed: "Закрытые"
      },
      employeeDynamics: {
        hired: "Приняты",
        left: "Ушли"
      }
    },
    recruitment: 'Рекрутмент',
    vacancies: {
      title: 'Вакансии',
      createNew: 'Создать вакансию',
      createFirst: 'Создать первую вакансию',
      status: {
        ALL: 'Все',
        OPEN: 'Открытые',
        PENDING: 'В ожидании',
        PENDING_APPROVAL: 'Ожидает одобрения',
        CLOSED: 'Закрытые'
      },
      candidates: 'Кандидаты',
      viewApplications: 'Посмотреть заявки',
      posted: 'опубликовано',
      noData: 'Пока нет вакансий',
      created: 'Вакансия успешно создана',
      deleted: 'Вакансия удалена',
      confirmDelete: 'Вы уверены, что хотите удалить эту вакансию?',
      loadError: 'Ошибка при загрузке вакансий',
      createError: 'Ошибка при создании вакансии',
      form: {
        title: 'Название должности',
        department: 'Отдел',
        location: 'Местоположение',
        salary: 'Зарплата',
        status: 'Статус',
        description: 'Описание',
        requirements: 'Требования'
      }
    },
    applications: {
      title: 'Отклики',
      new: 'Новая заявка',
      viewAll: 'Все заявки',
      status: {
        new: 'Новая',
        reviewing: 'Рассматривается',
        interview: 'Собеседование',
        accepted: 'Принята',
        rejected: 'Отклонена'
      },
      form: {
        step1: 'Личная информация',
        step2: 'Опыт и образование',
        step3: 'Требования и документы',
        step4: 'Подтверждение',
        firstName: 'Имя',
        lastName: 'Фамилия',
        email: 'Email',
        phone: 'Телефон',
        dob: 'Дата рождения',
        address: 'Адрес',
        source: 'Как вы о нас узнали?',
        educationLevel: 'Уровень образования',
        totalExperience: 'Общий стаж (в месяцах)',
        computerSkills: 'Владение компьютером',
        shiftWork: 'Готовность к сменному графику',
        manufacturingExp: 'Опыт работы на производстве',
        documents: 'Необходимые документы',
        passport: 'Паспорт / ID карта',
        diploma: 'Диплом / Аттестат',
        medical: 'Мед. справка',
        workBook: 'Трудовая книжка',
        consent: 'Я подтверждаю наличие всех документов и даю согласие на обработку данных',
        submit: 'Отправить заявку',
        next: 'Далее',
        back: 'Назад',
        success: 'Ваша заявка принята!',
        summary: 'Проверьте введенные данные перед отправкой'
      },
      score: 'Балл',
      source: 'Источник',
      appliedDate: 'Дата подачи'
    },
    apply: {
      title: 'Подача заявки на работу',
      subtitle: 'Заполните форму ниже, чтобы подать заявку на эту должность',
      steps: {
        personal: 'Личная информация',
        experience: 'Опыт работы',
        documents: 'Документы',
        confirm: 'Подтверждение'
      },
      fields: {
        firstName: 'Имя',
        lastName: 'Фамилия',
        email: 'Электронная почта',
        phone: 'Телефон',
        birthDate: 'Дата рождения',
        address: 'Адрес',
        source: 'Как вы о нас узнали?',
        education: 'Уровень образования',
        experienceMonths: 'Общий опыт (в месяцах)',
        computerSkill: 'Компьютерная грамотность',
        shiftReady: 'Я готов работать по сменам (утро / вечер / ночь)',
        manufacturingExp: 'У меня есть опыт в производстве',
        docsConfirm: 'Я подтверждаю наличие всех необходимых документов и даю согласие на обработку данных.'
      },
      sources: {
        website: 'Сайт компании',
        telegram: 'Telegram канал',
        referral: 'Рекомендация сотрудника',
        jobportal: 'Портал вакансий (hh.uz и др.)',
        other: 'Другое'
      },
      education: {
        secondary: 'Среднее специальное',
        college: 'Колледж / Техникум',
        bachelor: 'Бакалавр',
        master: 'Магистр'
      },
      computerSkills: {
        none: 'Нет',
        basic: 'Базовый (MS Office, Электронная почта)',
        advanced: 'Продвинутый'
      },
      actions: {
        next: 'Далее →',
        back: '← Назад',
        submit: 'Отправить заявку',
        submitting: 'Отправка...'
      },
      success: {
        title: 'Заявка принята!',
        text: 'Спасибо за подачу заявки. Ваш результат скрининга:',
        score: 'Ваш балл',
        nextStep: 'Мы свяжемся с вами по электронной почте на следующем этапе. Удачи!',
        accountCreated: 'Для вас создан личный кабинет',
        tempPassword: 'Временный пароль',
        changePasswordHint: 'Войдите с этими данными и смените пароль в разделе "Мой профиль".',
        status: {
          mini_interview: 'Вы приглашены на мини-интервью 🎉',
          screening_passed: 'Скрининг пройден — ожидайте следующего этапа',
          reserve_pool: 'Добавлены в кадровый резерв',
          rejected: 'Не подошло на данный момент'
        }
      },
      errors: {
        requiredFields: 'Пожалуйста, заполните все обязательные поля.',
        noVacancy: 'Вакансия не выбрана. Пожалуйста, откройте ссылку из объявления о вакансии.',
        docsRequired: 'Пожалуйста, подтвердите наличие всех необходимых документов.'
      }
    },
    candidates: {
      title: "КАНДИДАТЫ",
      table: {
        fullName: "ФИО",
        status: "СТАТУС",
        vacancy: "ВАКАНСИЯ",
        region: "РЕГИОН",
        stage: "ЭТАП",
        submitted: "ОТПРАВЛЕНО",
        actions: "ДЕЙСТВИЯ"
      },
      emptyState: "Пока нет кандидатов",
      searchPlaceholder: "Поиск кандидатов...",
      export: "Экспорт"
    },
    employees: 'Сотрудники',
    workforce: 'Персонал',
    onboarding: 'Онбординг',
    probation: 'Испытательный срок',
    kpiPerformance: 'KPI & Эффективность',
    careerPaths: 'Карьерные карты',
    settings: {
      title: 'Настройки',
      tabs: {
        profile: 'Профиль',
        account: 'Аккаунт',
        notifications: 'Уведомления',
        system: 'Система',
        users: 'Пользователи',
        data: 'Данные'
      },
      profile: {
        personalTitle: 'Личная информация',
        avatarLabel: 'Фото профиля',
        uploadBtn: 'Загрузить фото',
        firstName: 'Имя',
        lastName: 'Фамилия',
        email: 'Email адрес',
        phone: 'Номер телефона',
        jobTitle: 'Должность',
        department: 'Отдел',
        saveBtn: 'Сохранить изменения'
      },
      account: {
        securityTitle: 'Безопасность',
        changePassword: 'Сменить пароль',
        oldPassword: 'Текущий пароль',
        newPassword: 'Новый пароль',
        confirmPassword: 'Подтвердите новый пароль',
        twoFactor: 'Двухфакторная аутентификация',
        sessions: 'Активные сессии',
        logoutAll: 'Выйти на всех устройствах'
      },
      notifications: {
        channelsTitle: 'Каналы уведомлений',
        emailNotify: 'Email уведомления',
        pushNotify: 'Push уведомления',
        eventsTitle: 'События для уведомления',
        interviewReminders: 'Напоминания о собеседованиях',
        newApplications: 'Новые заявки',
        assignmentGraded: 'Оценка задания'
      },
      system: {
        generalTitle: 'Общие настройки системы',
        companyName: 'Название компании',
        uploadLogo: 'Загрузить логотип',
        defaultLang: 'Язык по умолчанию',
        timezone: 'Часовой пояс',
        interviewDuration: 'Длительность собеседования (мин)',
        autoScore: 'Автоматический расчет баллов'
      },
      users: {
        managementTitle: 'Управление пользователями',
        addUser: 'Добавить пользователя',
        table: {
          name: 'Имя',
          email: 'Email',
          role: 'Роль',
          status: 'Статус',
          lastLogin: 'Последний вход',
          actions: 'Действия'
        },
        status: {
          active: 'Активен',
          disabled: 'Отключен'
        }
      },
      data: {
        managementTitle: 'Управление данными',
        exportTitle: 'Экспорт данных',
        importTitle: 'Импорт данных',
        cleanupTitle: 'Очистка данных',
        cleanupWarning: 'Внимание! Это действие необратимо.',
        deleteAllData: 'Удалить все данные',
        deleteApplications: 'Удалить все заявки'
      }
    },
    training: {
      title: 'Пути развития',
      createNew: 'Создать новый путь',
      stages: 'Этапы',
      tasks: 'Задачи',
      progress: 'Мой прогресс',
      assignedTo: 'Назначено сотрудникам',
      pathDescription: 'Следите за своим прогрессом и отмечайте выполненные задания.',
      estimatedHours: 'Примерное время (часов)',
      estimatedMinutes: 'Примерное время (минут)',
      required: 'Обязательно',
      addTask: 'Добавить задачу',
      addStage: 'Добавить этап',
      type: {
        video: 'Видео',
        article: 'Статья',
        quiz: 'Тест',
        assignment: 'Задание'
      },
      myTraining: 'Мое обучение',
      trainingStats: 'Статистика обучения'
    },
    tests: {
      title: 'Тесты',
      import: 'Импорт',
      export: 'Экспорт',
      passingScore: 'Проходной балл',
      attemptsAllowed: 'Кол-во попыток',
      unlimited: 'Безлимитно',
      shuffleQuestions: 'Перемешать вопросы',
      shuffleOptions: 'Перемешать варианты',
      showResultImmediately: 'Показать результат сразу',
      category: 'Категория',
      questionType: 'Тип вопроса',
      single: 'Один вариант',
      multiple: 'Несколько вариантов',
      text: 'Текстовый ответ',
      addQuestion: 'Добавить вопрос',
      points: 'Баллы',
      timeLimit: 'Лимит времени (мин)',
      startTest: 'Начать тест',
      submitTest: 'Завершить тест',
      results: 'Результаты',
      myResults: 'Мои результаты',
      noResults: 'Результатов пока нет',
      score: 'Балл',
      status: 'Статус',
      completedAt: 'Завершено',
      attempt: 'Попытка'
    },
    profile: 'Профиль',
    sidebar: {
      main: "ОСНОВНОЕ",
      recruitment: "РЕКРУТМЕНТ",
      development: "ПУТИ РАЗВИТИЯ",
      workforce: "ПЕРСОНАЛ",
      lessons: "УРОКИ",
      lessonsList: "Уроки",
      myAssignments: "Мои задания",
      reviewAssignments: "Проверка заданий",
      lessonSettings: "Настройки",
      settings: "НАСТРОЙКИ",
    },
    search: 'Поиск по платформе...',
    goodMorning: 'Доброе утро',
    goodDay: 'Добрый день',
    goodEvening: 'Добрый вечер',
    active: 'Активных',
    endingIn5Days: 'Заканчиваются через 5 дней',
    recruitmentFunnel: 'Воронка рекрутмента',
    recentVacancies: 'Последние вакансии',
    vsLastMonth: 'по сравнению с прошлым месяцем',
    funnel: {
      stages: {
        applications: 'Заявки',
        screening: 'Скрининг',
        interviews: 'Собеседования',
        training: 'Обучение',
        hired: 'Приняты'
      }
    },
    insights: {
      recruitmentGrowth: {
        title: "Рост рекрутмента",
        description: "Поток кандидатов увеличился на 12% по сравнению с прошлым месяцем."
      },
      retentionRate: {
        title: "Коэффициент удержания",
        description: "Текучесть кадров остается на низком уровне (3.2%)."
      },
      actionRequired: {
        title: "Требуется действие",
        description: "Для 3 вакансий недостаточно кандидатов. Рекомендуется усилить рекламу."
      }
    },
    toolbar: {
      filter: "Фильтр",
      export: "Экспорт",
      pdfReport: "PDF Отчет",
      excelData: "Данные Excel",
      edit: "Редактировать"
    },
    metricsTitle: "Обзор кандидатов",
    recentCandidates: 'Последние кандидаты',
    createVacancy: 'Создать вакансию',
    status: {
      open: 'Открыта',
      pending: 'В ожидании',
      passed: 'Прошел',
      training: 'Обучение',
    },
    landing: {
      heroTitle: 'Начните карьеру в компании Nexo',
      heroSubtitle: 'Ознакомьтесь с открытыми вакансиями и подайте заявку за несколько минут',
      vacancies: 'Открытые вакансии',
      apply: 'Подать заявку',
      noVacancies: 'Пока нет открытых вакансий',
      login: 'Войти в систему',
    },
    candidateDashboard: {
      myApplication: 'Моя заявка',
      title: 'Статус моей заявки',
      noApplications: 'У вас пока нет активных заявок',
      applyMore: 'Посмотреть открытые вакансии',
      interviews: 'Собеседования',
      noInterviews: 'Собеседования пока не назначены',
      scheduledAt: 'Дата',
      score: 'Балл',
      training: 'Обучение',
      trainingLocked: 'Откроется после успешного прохождения собеседования',
      trainingUnlockedEmpty: 'Пока нет назначенных модулей обучения',
    },
    login: 'Вход',
    register: 'Регистрация',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    signIn: 'Войти',
    signUp: 'Зарегистрироваться',
    logout: 'Выход',
    rememberMe: 'Запомнить меня',
    forgotPassword: 'Забыли пароль?',
    noAccount: 'Нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
    lessons: 'Уроки',
    createLesson: 'Создать урок',
    lessonTitle: 'Заголовок урока',
    lessonDescription: 'Описание урока',
    videoUrl: 'Ссылка на видео',
    assignment: 'Задание',
    submitAssignment: 'Сдать задание',
    myAssignments: 'Мои задания',
    statusPending: 'В ожидании',
    statusSubmitted: 'Сдано',
    statusChecked: 'Проверено',
    reviewAssignments: 'Проверка заданий',
    errorPageNotFound: 'Страница не найдена',
    errorPageDescription: 'К сожалению, запрашиваемая страница не существует или была перемещена.',
    main: 'Главная',
    noCandidates: 'Кандидатов пока нет',
    noEmployees: 'Сотрудников пока нет',
    loading: 'Загрузка...',
    addNew: 'Добавить новый',
    edit: 'Редактировать',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    create: 'Создать',
    backToCandidates: 'Назад к кандидатам',
    firstName: 'Имя',
    lastName: 'Фамилия',
    phone: 'Телефон',
    email: 'Email',
    position: 'Должность',
    department: 'Отдел',
    statusLabel: 'Статус',
    stage: 'Этап',
    experience: 'Опыт работы',
    education: 'Образование',
    salary: 'Зарплата',
    location: 'Местоположение',
    assignmentReview: 'Проверка заданий',
    learningProgress: 'Прогресс обучения',
    assignLesson: 'Назначить урок',
    noLessonsFound: 'Уроки не найдены',
    gradeNow: 'Оценить',
    finalGrade: 'Итоговая оценка',
    verified: 'Проверено',
    all: 'Все',
    searchByName: 'Поиск по имени...',
    applied: 'Подано',
    actions: 'Действия',
    vacancy: 'Вакансия',
    shareAppLink: 'Поделиться ссылкой на заявку',
    viewProfile: 'Профиль',
    deleteCandidate: 'Удалить кандидата',
    confirmDeleteCandidate: 'Вы уверены, что хотите удалить этого кандидата?',
    candidatesModule: {
      kanban: 'Канбан',
      list: 'Список',
      searchCandidates: 'Поиск кандидатов...',
      exportSelect: 'Выберите формат экспорта',
      bulkActions: 'Групповые действия',
      sendMessage: 'Отправить сообщение',
      addToReserve: 'В резерв',
      changeStatus: 'Изменить статус',
      messageModal: {
        title: 'Отправить сообщение',
        placeholder: 'Введите текст сообщения...',
        send: 'Отправить',
        success: 'Сообщение отправлено кандидату'
      },
      profile: {
        info: 'Информация',
        interviews: 'Собеседования',
        documents: 'Документы',
        reserve: 'Резерв',
        noInterviews: 'Собеседований пока нет',
        inReserve: 'В резервном пуле',
        personalInfo: 'Личные данные',
        professionalInfo: 'Профессиональные данные',
        documentsCheck: 'Проверка документов',
        scheduleInterview: 'Назначить собеседование',
        editProfile: 'Редактировать профиль'
      }
    },
    interviews: {
      title: "Собеседования",
      schedule: "Назначить собеседование",
      status: {
        scheduled: "Запланировано",
        completed: "Проведено",
        cancelled: "Отменено",
        noShow: "Не явился"
      },
      type: {
        online: "Онлайн",
        offline: "Офлайн",
        phone: "Телефон"
      },
      result: {
        passed: "Прошел",
        failed: "Не прошел",
        pending: "Ожидается"
      },
      calendar: "Календарь",
      list: "Список",
      duration: "Длительность (мин)",
      location: "Место / Ссылка",
      notes: "Заметки",
      feedback: "Обратная связь"
    },
    reserve: {
      title: "Резервный пул",
      status: {
        active: "В резерве",
        hired: "Нанят",
        removed: "Исключен"
      },
      source: {
        interview: "После собеседования",
        application: "Из заявки",
        manual: "Вручную"
      },
      addToReserve: "Добавить в резерв",
      removeFromReserve: "Удалить из резерва",
      hiredFromReserve: "Принять на работу"
    },
    onboardingPage: {
      welcome: 'Добро пожаловать! Выполните эти шаги для успешной интеграции.',
      checklist: 'Ваш чек-лист',
      addTask: 'Добавить задачу',
      editTask: 'Редактировать задачу',
      newTask: 'Новая задача',
      deleteConfirm: 'Вы уверены, что хотите удалить эту задачу?',
      noTasks: 'Задачи пока не назначены.',
      title: 'Название',
      description: 'Описание',
      dueDate: 'Срок',
      mentor: 'Ваш ментор',
      noMentor: 'Ментор еще не назначен.',
      writeEmail: 'Написать письмо',
      internalMeet: 'Внутренняя встреча',
      joinVideo: 'Присоединиться',
      noMeeting: 'Нет запланированных встреч.',
      progress: 'Текущий прогресс',
      all: 'Все',
      pending: 'Ожидает',
      completed: 'Выполнено',
      search: 'Поиск задач...',
      saveChanges: 'Сохранить',
      createTask: 'Создать задачу',
      loading: 'Загрузка данных...',
      systemOverview: 'Обзор системы',
      tasksCompleted: 'задач выполнено'
    },
    careerMaps: {
      pageTitle: "Карьерные карты",
      newPosition: "Новая должность",
      subtitle: "Управляйте путями развития, этапами и навыками.",
      stats: {
        totalPaths: "Всего путей",
        activePaths: "Активные пути",
        talentDensity: "Плотность талантов",
        highPotential: "Высокий потенциал",
        growthVelocity: "Скорость роста",
        monthlyGrowth: "Ежемесячный рост",
        progressToTarget: "Прогресс к цели",
        latest: "Последнее обновление",
        vsLastMonth: "по сравнению с прошлым месяцем",
        target: "Цель"
      },
      careerHealth: {
        title: "ЗДОРОВЬЕ КАРЬЕРЫ",
        readiness: "Готовность",
        coverage: "Покрытие",
        talentPool: "Кадровый резерв",
        filledRoles: "Заполненные роли",
        readinessLevel: "Уровень готовности",
        readyNow: "Готов сейчас",
        readyIn6Months: "Готов через 6 мес.",
        readyIn1Year: "Готов через 1 год",
        lastUpdated: "Последнее обновление"
      },
      filters: {
        all: "Все",
        active: "Активные",
        completed: "Завершенные",
        highPotential: "Перспективные",
        search: "Поиск по должностям..."
      },
      tabs: {
        overview: "Обзор карьеры",
        tree: "Дерево должностей",
        employeeProfile: "Профиль сотрудника",
        skillGap: "Анализ навыков",
        developmentPlans: "Планы развития",
        talentPool: "Кадровый резерв",
        successionMatrix: "Матрица преемственности",
        analytics: "Карьерная аналитика"
      },
      positionCard: {
        grade: "Грейд",
        requiredSkills: "Необходимые навыки",
        nextPositions: "Следующие должности",
        readiness: "Готовность",
        edit: "Редактировать",
        delete: "Удалить"
      },
      emptyState: {
        title: "Карьерные пути еще не созданы",
        description: "Начните с определения ролей, картирования этапов роста и выявления ключевых компетенций для успеха вашей команды.",
        step1: {
          title: "Создание должности",
          description: "Определите роли и иерархию"
        },
        step2: {
          title: "Требования к навыкам",
          description: "Определите ключевые компетенции"
        },
        step3: {
          title: "Планирование роста",
          description: "Визуализируйте будущие траектории"
        },
        positionsCreated: "должностей создано",
        skillsDefined: "навыков определено",
        pathsPlanned: "путей запланировано",
        getStarted: "Начать"
      }
    }
  },
  uz: {
    dashboard: 'Asosiy panel',
    analytics: {
      title: 'Analitika',
      description: "Rivojlanish yo'llari, bosqichlar va ko'nikmalarni boshqaring.",
      stats: {
        totalCandidates: "Jami nomzodlar",
        avgTime: "O'rtacha vaqt",
        offerAcceptance: "Taklif qabuli",
        positionsFilled: "To'lgan o'rinlar",
        days: "kun"
      },
      vacancyStatus: {
        open: "Ochiq",
        pending: "Kutilmoqda",
        closed: "Yopiq"
      },
      employeeDynamics: {
        hired: "Qabul qilingan",
        left: "Ketgan"
      }
    },
    recruitment: 'Rekrutment',
    vacancies: {
      title: "Vakansiyalar",
      createNew: "Yangi vakansiya",
      createFirst: "Birinchi vakansiyani yaratish",
      status: {
        ALL: "Barchasi",
        OPEN: "Ochiq",
        PENDING: "Kutilmoqda",
        PENDING_APPROVAL: "Tasdiqlash kutilmoqda",
        CLOSED: "Yopiq"
      },
      candidates: "Nomzodlar",
      viewApplications: "Arizalarni ko'rish",
      posted: "yuborilgan",
      noData: "Hozircha vakansiyalar mavjud emas",
      created: "Vakansiya muvaffaqiyatli yaratildi",
      deleted: "Vakansiya o'chirildi",
      confirmDelete: "Bu vakansiyani o'chirishni tasdiqlaysizmi?",
      loadError: "Vakansiyalarni yuklashda xatolik yuz berdi",
      createError: "Vakansiya yaratishda xatolik yuz berdi",
      form: {
        title: "Lavozim nomi",
        department: "Bo'lim",
        location: "Manzil",
        salary: "Ish haqi",
        status: "Holat",
        description: "Tavsif",
        requirements: "Talablar"
      }
    },
    applications: {
      title: 'Arizalar',
      new: 'Yangi ariza',
      viewAll: 'Barcha arizalar',
      status: {
        new: 'Yangi',
        reviewing: 'Ko\'rib chiqilmoqda',
        interview: 'Suhbat',
        accepted: 'Qabul qilingan',
        rejected: 'Rad etilgan'
      },
      form: {
        step1: 'Shaxsiy ma\'lumotlar',
        step2: 'Tajriba va ta\'lim',
        step3: 'Talablar va hujjatlar',
        step4: 'Tasdiqlash',
        firstName: 'Ism',
        lastName: 'Familiya',
        email: 'Email',
        phone: 'Telefon',
        dob: 'Tug\'ilgan sana',
        address: 'Manzil',
        source: 'Biz haqimizda qayerdan eshitdingiz?',
        educationLevel: 'Ma\'lumot darajasi',
        totalExperience: 'Umumiy tajriba (oylarda)',
        computerSkills: 'Kompyuter savodxonligi',
        shiftWork: 'Smenali ish grafikiga rozilik',
        manufacturingExp: 'Ishlab chiqarishda tajriba',
        documents: 'Zaruriy hujjatlar',
        passport: 'Pasport / ID karta',
        diploma: 'Diplom / Attestat',
        medical: 'Tibbiy ma\'lumotnoma',
        workBook: 'Mehnat daftarchasi',
        consent: 'Barcha hujjatlar mavjudligini tasdiqlayman va ma\'lumotlarim qayta ishlanishiga roziman',
        submit: 'Ariza yuborish',
        next: 'Keyingi',
        back: 'Orqaga',
        success: 'Arizangiz qabul qilindi!',
        summary: 'Yuborishdan oldin ma\'lumotlarni tekshiring'
      },
      score: 'Ball',
      source: 'Manba',
      appliedDate: 'Topshirilgan sana'
    },
    apply: {
      title: 'Ishga ariza topshirish',
      subtitle: 'Ushbu lavozim uchun ariza topshirish uchun quyidagi shaklni to\'ldiring',
      steps: {
        personal: 'Shaxsiy ma\'lumotlar',
        experience: 'Tajriba',
        documents: 'Hujjatlar',
        confirm: 'Tasdiqlash'
      },
      fields: {
        firstName: 'Ism',
        lastName: 'Familiya',
        email: 'Elektron pochta',
        phone: 'Telefon',
        birthDate: 'Tug\'ilgan kun',
        address: 'Manzil',
        source: 'Biz haqimizda qayerdan eshitdingiz?',
        education: 'Ma\'lumot darajasi',
        experienceMonths: 'Umumiy tajriba (oylar)',
        computerSkill: 'Kompyuter savodxonligi',
        shiftReady: 'Smenali ishlashga tayyorman (tong / kech / tun)',
        manufacturingExp: 'Ishlab chiqarish sohasida tajribam bor',
        docsConfirm: 'Barcha kerakli hujjatlarim borligini tasdiqlayman va ma\'lumotlarimni qayta ishlanishiga roziman.'
      },
      sources: {
        website: 'Kompaniya sayti',
        telegram: 'Telegram kanal',
        referral: 'Xodim tavsiyasi',
        jobportal: 'Ish portali (hh.uz va boshqalar)',
        other: 'Boshqa'
      },
      education: {
        secondary: 'O\'rta maxsus',
        college: 'Kollej / Texnikum',
        bachelor: 'Bakalavr',
        master: 'Magistr'
      },
      computerSkills: {
        none: 'Yo\'q',
        basic: 'Boshlang\'ich (MS Office, Email)',
        advanced: 'Yuqori'
      },
      actions: {
        next: 'Keyingisi →',
        back: '← Orqaga',
        submit: 'Arizani topshirish',
        submitting: 'Yuborilmoqda...'
      },
      success: {
        title: 'Ariza qabul qilindi!',
        text: 'Ariza topshirganingiz uchun rahmat. Skrining natijangiz:',
        score: 'Sizning balingiz',
        nextStep: 'Keyingi bosqichda siz bilan elektron pochta orqali bog\'lanamiz. Omad!',
        accountCreated: 'Siz uchun shaxsiy kabinet yaratildi',
        tempPassword: 'Vaqtinchalik parol',
        changePasswordHint: 'Ushbu ma\'lumotlar bilan tizimga kiring va "Mening profilim" bo\'limida parolni almashtiring.',
        status: {
          mini_interview: 'Mini-intervyuga taklif qilindingiz 🎉',
          screening_passed: 'Skriningdan o\'tdingiz - keyingi bosqichni kuting',
          reserve_pool: 'Zaxira jamg\'armasiga qo\'shildingiz',
          rejected: 'Hozirgi vaqtda mos kelmadi'
        }
      },
      errors: {
        requiredFields: 'Iltimos, barcha majburiy maydonlarni to\'ldiring.',
        noVacancy: 'Vakansiya tanlanmagan. Iltimos, vakansiya e\'lonidan havola orqali kiring.',
        docsRequired: 'Iltimos, barcha kerakli hujjatlaringiz borligini tasdiqlang.'
      }
    },
    candidates: {
      title: "NOMOZLAR",
      table: {
        fullName: "ISMI FAMILIYASI",
        status: "HOLAT",
        vacancy: "VAKANSIYA",
        region: "HUDUD",
        stage: "BOSQICH",
        submitted: "TOPSHIRILDI",
        actions: "AMALLAR"
      },
      emptyState: "Hozircha nomzodlar yo'q",
      searchPlaceholder: "Nomzodlarni qidirish...",
      export: "Eksport"
    },
    employees: 'Hozircha xodimlar yo\'q',
    workforce: 'Personal',
    onboarding: 'Onbording',
    probation: 'Sinov muddati',
    kpiPerformance: 'KPI va Samaradorlik',
    careerPaths: 'Karyera xaritalari',
    settings: {
      title: 'Sozlamalar',
      tabs: {
        profile: 'Profil',
        account: 'Hisob',
        notifications: 'Bildirishnomalar',
        system: 'Tizim',
        users: 'Foydalanuvchilar',
        data: 'Ma\'lumotlar'
      },
      profile: {
        personalTitle: 'Shaxsiy ma\'lumotlar',
        avatarLabel: 'Profil rasmi',
        uploadBtn: 'Rasm yuklash',
        firstName: 'Ism',
        lastName: 'Familiya',
        email: 'Email manzili',
        phone: 'Telefon raqami',
        jobTitle: 'Lavozimi',
        department: 'Bo\'limi',
        saveBtn: 'O\'zgarishlarni saqlash'
      },
      account: {
        securityTitle: 'Xavfsizlik',
        changePassword: 'Parolni o\'zgartirish',
        oldPassword: 'Joriy parol',
        newPassword: 'Yangi parol',
        confirmPassword: 'Yangi parolni tasdiqlash',
        twoFactor: 'Ikki bosqichli autentifikatsiya',
        sessions: 'Faol sessiyalar',
        logoutAll: 'Barcha qurilmalardan chiqish'
      },
      notifications: {
        channelsTitle: 'Bildirishnoma kanallari',
        emailNotify: 'Email bildirishnomalar',
        pushNotify: 'Push bildirishnomalar',
        eventsTitle: 'Bildirishnoma hodisalari',
        interviewReminders: 'Suhbat eslatmalari',
        newApplications: 'Yangi arizalar',
        assignmentGraded: 'Topshiriq baholanishi'
      },
      system: {
        generalTitle: 'Tizimning umumiy sozlamalari',
        companyName: 'Kompaniya nomi',
        uploadLogo: 'Logotip yuklash',
        defaultLang: 'Standart til',
        timezone: 'Vaqt zonasi',
        interviewDuration: 'Suhbat davomiyligi (daq)',
        autoScore: 'Ballarni avtomatik hisoblash'
      },
      users: {
        managementTitle: 'Foydalanuvchilarni boshqarish',
        addUser: 'Foydalanuvchi qo\'shish',
        table: {
          name: 'Ism',
          email: 'Email',
          role: 'Rol',
          status: 'Holat',
          lastLogin: 'Oxirgi kirish',
          actions: 'Amallar'
        },
        status: {
          active: 'Faol',
          disabled: 'O\'chirilgan'
        }
      },
      data: {
        managementTitle: 'Ma\'lumotlarni boshqarish',
        exportTitle: 'Ma\'lumotlarni eksport qilish',
        importTitle: 'Ma\'lumotlarni import qilish',
        cleanupTitle: 'Ma\'lumotlarni tozalash',
        cleanupWarning: 'Diqqat! Bu amalni qaytarib bo\'lmaydi.',
        deleteAllData: 'Barcha ma\'lumotlarni o\'chirish',
        deleteApplications: 'Barcha arizalarni o\'chirish'
      }
    },
    profile: 'Profil',
    sidebar: {
      main: "ASOSIY",
      recruitment: "REKRUTMENT",
      development: "RIVOJLANISH YO‘LLARI",
      workforce: "XODIMLAR",
      lessons: "DARSLAR",
      lessonsList: "Darslar",
      myAssignments: "Mening topshiriqlarim",
      reviewAssignments: "Topshiriqlarni tekshirish",
      lessonSettings: "Sozlamalar",
      settings: "SOZLAMALAR",
    },
    search: 'Platforma bo\'ylab qidirish...',
    goodMorning: 'Xayrli tong',
    goodDay: 'Xayrli kun',
    goodEvening: 'Xayrli kech',
    active: 'Faol',
    endingIn5Days: '5 kunda tugaydi',
    recruitmentFunnel: 'Rekrutment voronkasi',
    recentVacancies: 'So\'nggi vakansiyalar',
    vsLastMonth: 'o\'tgan oyga nisbatan',
    funnel: {
      stages: {
        applications: 'Arizalar',
        screening: 'Saralash',
        interviews: 'Suhbatlar',
        training: 'Trening',
        hired: 'Ishga qabul qilingan'
      }
    },
    insights: {
      recruitmentGrowth: {
        title: "Rekrutment o'sishi",
        description: "Nomzodlar oqimi o'tgan oyga nisbatan 12% ga oshdi."
      },
      retentionRate: {
        title: "Xodimlarni saqlab qolish",
        description: "Xodimlar almashinuvi (churn rate) past darajada (3.2%)."
      },
      actionRequired: {
        title: "Harakat talab etiladi",
        description: "3 ta vakansiya uchun nomzodlar yetarli emas. Reklamani kuchaytiring."
      }
    },
    toolbar: {
      filter: "Filtr",
      export: "Eksport",
      pdfReport: "PDF Hisobot",
      excelData: "Excel Ma'lumot",
      edit: "Tahrirlash"
    },
    metricsTitle: "Nomzodlar statistikasi",
    recentCandidates: 'So\'nggi nomzodlar',
    createVacancy: 'Vakansiya yaratish',
    status: {
      open: 'Ochiq',
      pending: 'Kutilmoqda',
      passed: 'O\'tdi',
      training: 'O\'quv jarayoni',
    },
    landing: {
      heroTitle: "Nexo kompaniyasida karyerangizni boshlang",
      heroSubtitle: "Ochiq vakansiyalarni ko'ring va bir necha daqiqada ariza topshiring",
      vacancies: 'Ochiq vakansiyalar',
      apply: 'Ariza topshirish',
      noVacancies: 'Hozircha ochiq vakansiyalar mavjud emas',
      login: 'Tizimga kirish',
    },
    candidateDashboard: {
      myApplication: 'Mening arizam',
      title: 'Arizamning holati',
      noApplications: "Sizda hozircha faol arizalar yo'q",
      applyMore: 'Ochiq vakansiyalarni ko\'rish',
      interviews: 'Suhbatlar',
      noInterviews: 'Hozircha suhbat belgilanmagan',
      scheduledAt: 'Sana',
      score: 'Ball',
      training: "O'quv",
      trainingLocked: "Suhbatdan muvaffaqiyatli o'tgach ochiladi",
      trainingUnlockedEmpty: "Hozircha tayinlangan o'quv modullari yo'q",
    },
    login: 'Kirish',
    register: 'Ro\'yxatdan o\'tish',
    password: 'Parol',
    confirmPassword: 'Parolni tasdiqlash',
    signIn: 'Kirish',
    signUp: 'Ro\'yxatdan o\'tish',
    logout: 'Chiqish',
    rememberMe: 'Eslab qolish',
    forgotPassword: 'Parolni unutdingizmi?',
    noAccount: 'Akkauntingiz yo\'qmi?',
    haveAccount: 'Akkauntingiz bormi?',
    lessons: 'Darslar',
    createLesson: 'Dars yaratish',
    lessonTitle: 'Dars sarlavhasi',
    lessonDescription: 'Dars tavsifi',
    videoUrl: 'Video havola',
    assignment: 'Topshiriq',
    submitAssignment: 'Topshiriqni yuborish',
    myAssignments: 'Mening topshiriqlarim',
    statusPending: 'Kutilmoqda',
    statusSubmitted: 'Yuborilgan',
    statusChecked: 'Tekshirilgan',
    reviewAssignments: 'Topshiriqlarni tekshirish',
    errorPageNotFound: 'Sahifa topilmadi',
    errorPageDescription: 'Uzr, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko\'chirilgan.',
    main: 'Asosiy',
    noCandidates: 'Hozircha nomzodlar yo\'q',
    noEmployees: 'Hozircha xodimlar yo\'q',
    loading: 'Ma\'lumotlar yuklanmoqda...',
    addNew: 'Yangi qo\'shish',
    create: 'Yaratish',
    delete: 'O\'chirish',
    edit: 'Tahrirlash',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    firstName: 'Ism',
    lastName: 'Familiya',
    phone: 'Telefon',
    email: 'Email',
    position: 'Lavozim',
    department: 'Bo\'lim',
    statusLabel: 'Status',
    stage: 'Bosqich',
    experience: 'Ish tajribasi',
    education: 'Ma\'lumot',
    salary: 'Maosh',
    location: 'Manzil',
    assignmentReview: 'Topshiriqlarni tekshirish',
    learningProgress: 'O\'quv jarayoni',
    assignLesson: 'Darsni tayinlash',
    noLessonsFound: 'Darslar topilmadi',
    gradeNow: 'Baholash',
    finalGrade: 'Yakuniy baho',
    verified: 'Tekshirilgan',
    all: 'Barchasi',
    searchByName: 'Ism bo\'yicha qidirish...',
    applied: 'Topshirildi',
    actions: 'Amallar',
    vacancy: 'Vakansiya',
    shareAppLink: 'Ariza topshirish havolasini ulashish',
    viewProfile: 'Profil',
    deleteCandidate: 'Nomzodni o\'chirish',
    confirmDeleteCandidate: 'Nomzodni o\'chirishni tasdiqlaysizmi?',
    candidatesModule: {
      kanban: 'Kanban',
      list: 'Ro\'yxat',
      searchCandidates: 'Nomzodlarni qidirish...',
      exportSelect: 'Eksport formatini tanlang',
      bulkActions: 'Guruhli amallar',
      sendMessage: 'Xabar yuborish',
      addToReserve: 'Rezervga',
      changeStatus: 'Statusni o\'zgartirish',
      messageModal: {
        title: 'Xabar yuborish',
        placeholder: 'Xabar matnini kiriting...',
        send: 'Yuborish',
        success: 'Xabar nomzodga yuborildi'
      },
      profile: {
        info: 'Ma\'lumotlar',
        interviews: 'Suhbatlar',
        documents: 'Hujjatlar',
        reserve: 'Rezerv',
        noInterviews: 'Hozircha suhbatlar yo\'q',
        inReserve: 'Rezerv pulida',
        personalInfo: 'Shaxsiy ma\'lumotlar',
        professionalInfo: 'Kasbiy ma\'lumotlar',
        documentsCheck: 'Hujjatlarni tekshirish',
        scheduleInterview: 'Suhbat tayinlash',
        editProfile: 'Profilni tahrirlash'
      }
    },
    interviews: {
      title: "Suhbatlar",
      schedule: "Yangi suhbat",
      status: {
        scheduled: "Rejalashtirilgan",
        completed: "O‘tkazilgan",
        cancelled: "Bekor qilingan",
        noShow: "Kelilmagan"
      },
      type: {
        online: "Onlayn",
        offline: "Oflayn",
        phone: "Telefon"
      },
      result: {
        passed: "O‘tdi",
        failed: "O‘tmadi",
        pending: "Kutilmoqda"
      },
      calendar: "Taqvim",
      list: "Ro'yxat",
      duration: "Davomiyligi (daq)",
      location: "Manzil / Havola",
      notes: "Izohlar",
      feedback: "Fikr-mulohaza"
    },
    reserve: {
      title: "Rezerv puli",
      status: {
        active: "Rezervda",
        hired: "Ishga olindi",
        removed: "O'chirildi"
      },
      source: {
        interview: "Suhbatdan keyin",
        application: "Arizadan",
        manual: "Qo'lda"
      },
      addToReserve: "Rezervga qo'shish",
      removeFromReserve: "Rezervdan o'chirish",
      hiredFromReserve: "Ishga qabul qilish"
    },
    onboardingPage: {
      welcome: 'Xush kelibsiz! Muvaffaqiyatli integratsiya uchun quyidagi bosqichlarni bajaring.',
      checklist: 'Sizning vazifalaringiz',
      addTask: 'Vazifa qo\'shish',
      editTask: 'Vazifani tahrirlash',
      newTask: 'Yangi vazifa',
      deleteConfirm: 'Bu vazifani o\'chirishni tasdiqlaysizmi?',
      noTasks: 'Hozircha vazifalar tayinlanmagan.',
      title: 'Nomi',
      description: 'Tavsif',
      dueDate: 'Muddat',
      mentor: 'Sizning mentoringiz',
      noMentor: 'Mentor hali tayinlanmagan.',
      writeEmail: 'Xat yozish',
      internalMeet: 'Ichki uchrashuv',
      joinVideo: 'Qo\'shilish',
      noMeeting: 'Rejalashtirilgan uchrashuvlar yo\'q.',
      progress: 'Joriy progress',
      all: 'Barchasi',
      pending: 'Kutilmoqda',
      completed: 'Bajarilgan',
      search: 'Vazifalarni qidirish...',
      saveChanges: 'Saqlash',
      createTask: 'Vazifa yaratish',
      loading: 'Ma\'lumotlar yuklanmoqda...',
      systemOverview: 'Tizim sharhi',
      tasksCompleted: 'vazifa bajarildi'
    },
    training: {
      title: "Rivojlanish yo'llari",
      createNew: "Yangi yo'nalish yaratish",
      stages: "Bosqichlar",
      tasks: "Vazifalar",
      progress: "Mening progressim",
      assignedTo: "Tayinlangan xodimlar",
      pathDescription: "O'z yo'lingizni kuzatib boring va bajarilgan qadamlarni belgilang.",
      estimatedHours: "Taxminiy vaqt (soat)",
      estimatedMinutes: "Taxminiy vaqt (daqiqa)",
      required: "Majburiy",
      addTask: "Vazifa qo'shish",
      addStage: "Bosqich qo'shish",
      type: {
        video: "Video",
        article: "Maqola",
        quiz: "Test",
        assignment: "Topshiriq"
      },
      myTraining: "Mening treninglarim",
      trainingStats: "Trening statistikasi"
    },
    tests: {
      title: "Testlar",
      import: "Import qilish",
      export: "Eksport",
      passingScore: "O'tish bali",
      attemptsAllowed: "Urinishlar soni",
      unlimited: "Cheksiz",
      shuffleQuestions: "Savollarni aralashtirish",
      shuffleOptions: "Variantlarni aralashtirish",
      showResultImmediately: "Natijani darhol ko'rsatish",
      category: "Kategoriya",
      questionType: "Savol turi",
      single: "Bitta to'g'ri javob",
      multiple: "Bir nechta to'g'ri javob",
      text: "Matnli javob",
      addQuestion: "Savol qo'shish",
      points: "Ball",
      timeLimit: "Vaqt cheklovi (daqiqa)",
      startTest: "Testni boshlash",
      submitTest: "Testni yakunlash",
      results: "Natijalar",
      myResults: "Mening natijalarim",
      noResults: "Hozircha natijalar yo'q",
      score: "Ball",
      status: "Status",
      completedAt: "Tugatildi",
      attempt: "Urinish"
    },
    careerMaps: {
      pageTitle: "Karyera xaritalari",
      newPosition: "Yangi lavozim",
      subtitle: "Rivojlanish yo'llari, bosqichlar va ko'nikmalarni boshqaring.",
      stats: {
        totalPaths: "Jami yo‘llar",
        activePaths: "Faol yo‘llar",
        talentDensity: "Isteʼdod zichligi",
        highPotential: "Yuqori salohiyat",
        growthVelocity: "O‘sish tezligi",
        monthlyGrowth: "Oylik o‘sish",
        progressToTarget: "Maqsadga nisbatan",
        latest: "So‘nggi yangilanish",
        vsLastMonth: "o‘tgan oyga nisbatan",
        target: "Maqsad"
      },
      careerHealth: {
        title: "KARYERA HOLATI",
        readiness: "Tayyorgarlik",
        coverage: "Qoplama",
        talentPool: "Isteʼdodlar zaxirasi",
        filledRoles: "Toʻldirilgan rollar",
        readinessLevel: "Tayyorlik darajasi",
        readyNow: "Hozir tayyor",
        readyIn6Months: "6 oyda tayyor",
        readyIn1Year: "1 yilda tayyor",
        lastUpdated: "So‘nggi yangilanish"
      },
      filters: {
        all: "Barchasi",
        active: "Faol",
        completed: "Tugallangan",
        highPotential: "Istiqbolli",
        search: "Lavozimlar bo'yicha qidirish..."
      },
      tabs: {
        overview: "Karyera sharhi",
        tree: "Lavozimlar daraxti",
        employeeProfile: "Xodim profili",
        skillGap: "Ko‘nikmalar tahlili",
        developmentPlans: "Rivojlanish rejalari",
        talentPool: "Iste'dodlar zaxirasi",
        successionMatrix: "Vorislik matritsasi",
        analytics: "Karyera analitikasi"
      },
      positionCard: {
        grade: "Grade",
        requiredSkills: "Kerakli ko‘nikmalar",
        nextPositions: "Keyingi lavozimlar",
        readiness: "Tayyorlik",
        edit: "Tahrirlash",
        delete: "O‘chirish"
      },
      emptyState: {
        title: "Hali hech qanday karyera yo‘li yaratilmagan",
        description: "Lavozimlarni belgilash, o‘sish bosqichlarini xaritalash va jamoangiz muvaffaqiyati uchun asosiy ko‘nikmalarni aniqlashdan boshlang.",
        step1: {
          title: "Lavozim yaratish",
          description: "Rollar va ierarxiyani belgilang"
        },
        step2: {
          title: "Ko‘nikma talablari",
          description: "Asosiy kompetentsiyalarni aniqlang"
        },
        step3: {
          title: "O‘sish yo‘llari",
          description: "Kelajak traektoriyalarini ko‘ring"
        },
        positionsCreated: "lavozim yaratildi",
        skillsDefined: "ko‘nikma aniqlandi",
        pathsPlanned: "yo‘l rejalashtirildi",
        getStarted: "Boshlash"
      }
    }
  }
};

export type Language = 'ru' | 'uz';
export type TranslationKey = keyof typeof translations.ru;
