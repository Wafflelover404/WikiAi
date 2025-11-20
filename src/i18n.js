// Simple i18n (internationalization) system for the app
export const translations = {
  en: {
    // Home Page
    home: {
      welcomeTitle: 'Welcome to',
      welcomeBrand: 'WikiAi',
      subtitle: 'Your intelligent knowledge base companion',
      quickSearchPlaceholder: 'Quick search your knowledge base...',
      quickSearchButton: 'Search',
      overviewTitle: 'Overview',
      totalDocuments: 'Total Documents',
      searchesToday: 'Searches Today',
      avgResponseTime: 'Avg Response Time',
      activeUsersToday: 'Active Users Today',
      activeSessions: 'Active Sessions',
      quickActionsTitle: 'Quick Actions',
      actionAdvancedSearchTitle: 'Advanced Search',
      actionAdvancedSearchDesc: 'Search across all documents with AI',
      actionBrowseFilesTitle: 'Browse Files',
      actionBrowseFilesDesc: 'Explore your document library',
      actionAdminPanelTitle: 'Admin Panel',
      actionAdminPanelDesc: 'Manage users and system settings',
      actionAnalyticsTitle: 'Analytics',
      actionAnalyticsDesc: 'View usage statistics and insights',
      actionStatisticsTitle: 'Statistics',
      actionStatisticsDesc: 'View your activity overview',
      actionAskTitle: 'Ask a Question',
      actionAskDesc: 'Chat with your knowledge base',
      popularFilesTitle: 'Most Referenced Files',
      popularLoading: 'Loading popular files...',
      popularEmpty: 'No file references yet',
      popularRefs: 'references',
      systemStatusTitle: 'System Status',
      systemSearchEngine: 'Search Engine',
      systemOperational: 'Operational',
      systemAIProcessing: 'AI Processing',
      systemStorage: 'Storage',
      systemStorageUsed: 'Used',
      tipsTitle: 'Tips & Tricks',
      tipsUseSpecificKeywordsTitle: 'Use specific keywords',
      tipsUseSpecificKeywordsDesc: 'Try searching with technical terms and specific file names for better results'
    },
    // Header
    header: {
      tagline: 'AI-Powered Knowledge Management',
      product: 'Product',
      team: 'Team',
      goals: 'Goals',
      contact: 'Contact',
      getStarted: 'Get Started',
      lightMode: 'Light Mode',
      darkMode: 'Dark Mode'
    },
    // Hero Section
    hero: {
      title: ['Transform', 'Your', 'Knowledge', 'With AI'],
      subtitle: 'Organize, search, and manage your knowledge effortlessly with intelligent AI-powered features.',
      launchApp: 'Launch Application',
      learnMore: 'Learn More',
      documentsIndexed: 'Documents Indexed',
      uptime: 'Uptime',
      avgSearch: 'Avg Search'
    },
    // Hero Cards
    heroCards: {
      knowledgeBase: 'Knowledge Base',
      smartSearch: 'Smart Search',
      aiInsights: 'AI Insights'
    },
    // Product Features
    product: {
      title: 'Powerful Features',
      subtitle: 'Everything you need to manage your knowledge effectively',
      features: [
        {
          title: 'Knowledge Base',
          description: 'Upload, organize, and manage documents across multiple formats effortlessly'
        },
        {
          title: 'Smart Search',
          description: 'AI-powered search finds exactly what you need in milliseconds'
        },
        {
          title: 'AI Insights',
          description: 'Generate summaries and extract key information automatically'
        },
        {
          title: 'Analytics',
          description: 'Track usage patterns and optimize your knowledge base'
        },
        {
          title: 'Access Control',
          description: 'Role-based security protects sensitive information'
        },
        {
          title: 'High Performance',
          description: 'Lightning-fast processing with optimized indexing'
        }
      ]
    },
    // Team Section
    team: {
      title: 'Meet the Team',
      subtitle: 'Talented people building amazing technology',
      members: [
        {
          name: 'Ivan Afanasyeff',
          role: 'Lead Developer',
          bio: 'Software development and support, search algorithms'
        },
        {
          name: 'Victoria Beznoshchenko',
          role: 'Operations Director',
          bio: 'Operational activities and internal processes'
        },
        {
          name: 'Ilya Ermalkevich',
          role: 'CEO',
          bio: 'Business process management and strategic planning'
        }
      ]
    },
    // Goals Section
    goals: {
      title: 'Our Mission',
      subtitle: 'Revolutionizing how organizations manage knowledge',
      items: [
        {
          title: 'Democratize Knowledge',
          description: 'Make powerful AI accessible to all organizations'
        },
        {
          title: 'Boost Productivity',
          description: 'Reduce search time and focus on high-value work'
        },
        {
          title: 'Enable Collaboration',
          description: 'Foster knowledge sharing across teams'
        },
        {
          title: 'Drive Innovation',
          description: 'Accelerate growth with collective intelligence'
        }
      ]
    },
    // Contact Section
    contact: {
      title: 'Get in Touch',
      subtitle: "We'd love to hear from you",
      items: [
        {
          title: 'Email',
          text: 'info.wikiai@gmail.com'
        },
        {
          title: 'Phone',
          text: '+375297345682'
        },
        {
          title: 'Telegram',
          text: '@vikigolubeva'
        },
        {
          title: 'Support',
          text: 'Get in-app support'
        }
      ]
    },
    // Footer
    footer: {
      copyright: '© 2025 WikiAi. All rights reserved.',
      product: 'Product',
      team: 'Team',
      goals: 'Goals',
      contact: 'Contact'
    },
    // Navigation & Sidebar
    nav: {
      home: 'Home',
      files: 'Files',
      search: 'Search',
      about: 'About',
      admin: 'Admin',
      loadingSession: 'Loading session...',
      toggleMenu: 'Toggle menu',
      language: 'Language',
      selectLanguage: 'Select language',
      english: 'English',
      russian: 'Russian',
      switchToEnglish: 'Switch to English',
      switchToRussian: 'Switch to Russian'
    },
    // Files Page
    files: {
      title: 'Files',
      subtitle: 'Browse and manage your document library',
      searchPlaceholder: 'Search files...',
      allTypes: 'All Types',
      documents: 'Documents',
      images: 'Images',
      pdfs: 'PDFs',
      newestFirst: 'Newest First',
      oldestFirst: 'Oldest First',
      loading: 'Loading...',
      filesCount: 'files',
      lastUpdated: 'Last updated:',
      download: 'Download',
      quiz: 'Quiz !',
      share: 'Share',
      delete: 'Delete',
      noFiles: 'No files found'
    },
    // Search Page
    search: {
      title: 'Search',
      subtitle: 'Find knowledge instantly with AI-powered search',
      searchPlaceholder: 'Enter your query...',
      search: 'Search',
      results: 'Search Results',
      noResults: 'No results found',
      relevance: 'Relevance'
    },
    // Admin Panel
    admin: {
      title: 'Admin Dashboard',
      users: 'Users',
      analytics: 'Analytics',
      settings: 'Settings',
      logs: 'Logs',
      manageUsers: 'Manage Users',
      viewAnalytics: 'View Analytics',
      systemSettings: 'System Settings',
      viewLogs: 'View Logs',
      addUser: 'Add User',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      username: 'Username',
      email: 'Email',
      role: 'Role',
      admin: 'Admin',
      user: 'User',
      editor: 'Editor',
      active: 'Active',
      inactive: 'Inactive',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      close: 'Close',
      confirm: 'Confirm',
      confirmDelete: 'Are you sure you want to delete this user?',
      noUsers: 'No users found',
      createFirstUser: 'Create your first user to get started',
      autoRefreshOn: 'Auto-refresh ON',
      autoRefreshOff: 'Auto-refresh OFF',
      reportsTitle: 'Reports & Analytics',
      totalReports: 'Total Reports',
      autoReports: 'Auto Reports',
      manualReports: 'Manual Reports',
      automaticReportsTab: 'Automatic',
      manualReportsTab: 'Manual',
      automaticReportsHeader: 'Automatic System Reports',
      automaticReportsDesc: 'Reports generated automatically by the system for security, access control, and system health monitoring.',
      noAutomaticReports: 'No Automatic Reports',
      noAutomaticReportsDesc: 'The system is running smoothly with no automatic reports to display.',
      manualReportsHeader: 'User-Submitted Reports',
      manualReportsDesc: 'Reports submitted by users for issues, feature requests, or general feedback.',
      noManualReports: 'No Manual Reports',
      noManualReportsDesc: "Users haven't submitted any reports yet.",
      systemAdminTitle: 'System Administration',
      systemOnline: 'System Online',
      systemOperations: 'System Operations',
      systemOperationsDesc: 'Manage system data and refresh information',
      autoRefreshLabel: 'Auto-refresh',
      updateEvery: 'Update Every',
      lastUpdates: 'Last Updates',
      testApi: 'Test API',
      test: 'Test',
      apiDocsTitle: 'API Documentation',
      apiDocsDesc: 'Available endpoints and their usage',
      // Additional translations for admin dashboard
      lastLogin: 'Last Login',
      filesAccess: 'Files Access',
      actions: 'Actions',
      adminBadge: 'Admin',
      never: 'Never',
      edit: 'Edit',
      deleteBtn: 'Delete',
      createNewUser: 'Create New User',
      password: 'Password',
      filePermissions: 'File Permissions',
      filesAccessible: 'files will be accessible',
      of: 'of',
      allFiles: 'All Files',
      fullAccess: 'Full access',
      selectFiles: 'Select Files',
      customAccess: 'Custom access',
      searchFiles: 'Search files...',
      all: 'All',
      none: 'None',
      createUser: 'Create User',
      fileManagement: 'File Management',
      uploadFile: 'Upload File',
      enterFile: 'Enter File',
      dragDropFiles: 'Drag & Drop Files Here',
      browseFiles: 'browse files',
      filename: 'Filename',
      fileContent: 'File Content',
      submitFile: 'Submit File',
      file: 'File',
      type: 'Type',
      size: 'Size',
      uploaded: 'Uploaded',
      preview: 'Preview',
      fileAccessDetails: 'File Access Details',
      fullAccessToAll: 'Full access to all files (including future uploads)',
      noFileAccess: 'No file access granted',
      noFilesFound: 'No files found',
      tryAdjustingSearch: 'Try adjusting your search terms',
      noFilesAvailable: 'No files available',
      noFilesMatch: 'No files match',
      cannotDeleteAdmin: 'Cannot delete admin user',
      hidePassword: 'Hide password',
      showPassword: 'Show password'
    },
    // Login
    login: {
      title: 'Welcome to WikiAi',
      subtitle: 'Sign in to your account',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      loginError: 'Invalid username or password',
      loggingIn: 'Logging in...',
      apiUrl: 'API URL',
      apiUrlPlaceholder: 'http://localhost:9001',
      rememberMe: 'Remember Me',
      proxyWarning: 'Using proxy - set VITE_API_PROXY in .env',
      selectServer: 'Select a saved server URL',
      noSavedServers: 'No saved servers yet',
      viewServerAddress: 'View server address',
      hideServerAddress: 'Hide server address',
      serverPanelTitle: 'Connection settings',
      serverPanelSubtitle: 'Update or reuse an API endpoint'
    },
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      close: 'Close',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      back: 'Back',
      share: 'Share',
      edit: 'Edit',
      open: 'Open',
      download: 'Download',
      or: 'or'
    }
  },
  ru: {
    // Home Page
    home: {
      welcomeTitle: 'Добро пожаловать в',
      welcomeBrand: 'WikiAi',
      subtitle: 'Ваш интеллектуальный помощник по базе знаний',
      quickSearchPlaceholder: 'Быстрый поиск по вашей базе знаний...',
      quickSearchButton: 'Поиск',
      overviewTitle: 'Обзор',
      totalDocuments: 'Всего документов',
      searchesToday: 'Поисков сегодня',
      avgResponseTime: 'Среднее время ответа',
      activeUsersToday: 'Активных пользователей сегодня',
      activeSessions: 'Активные сессии',
      quickActionsTitle: 'Быстрые действия',
      actionAdvancedSearchTitle: 'Расширенный поиск',
      actionAdvancedSearchDesc: 'Ищите по всем документам с помощью ИИ',
      actionBrowseFilesTitle: 'Просмотр файлов',
      actionBrowseFilesDesc: 'Исследуйте вашу библиотеку документов',
      actionAdminPanelTitle: 'Панель администратора',
      actionAdminPanelDesc: 'Управление пользователями и настройками системы',
      actionAnalyticsTitle: 'Аналитика',
      actionAnalyticsDesc: 'Просмотр статистики использования и инсайтов',
      actionStatisticsTitle: 'Статистика',
      actionStatisticsDesc: 'Обзор вашей активности',
      actionAskTitle: 'Задать вопрос',
      actionAskDesc: 'Общайтесь с вашей базой знаний',
      popularFilesTitle: 'Наиболее востребованные файлы',
      popularLoading: 'Загрузка популярных файлов...',
      popularEmpty: 'Ссылок на файлы пока нет',
      popularRefs: 'упоминаний',
      systemStatusTitle: 'Статус системы',
      systemSearchEngine: 'Поисковый движок',
      systemOperational: 'Работает',
      systemAIProcessing: 'AI обработка',
      systemStorage: 'Хранилище',
      systemStorageUsed: 'Использовано',
      tipsTitle: 'Советы и хитрости',
      tipsUseSpecificKeywordsTitle: 'Используйте конкретные ключевые слова',
      tipsUseSpecificKeywordsDesc: 'Пробуйте искать по техническим терминам и конкретным названиям файлов для лучшего результата'
    },
    // Header
    header: {
      tagline: 'Управление знаниями на базе ИИ',
      product: 'Продукт',
      team: 'Команда',
      goals: 'Цели',
      contact: 'Контакты',
      getStarted: 'Начать',
      lightMode: 'Светлый режим',
      darkMode: 'Темный режим'
    },
    // Hero Section
    hero: {
      title: ['Трансформируйте', 'Ваши', 'Знания', 'с ИИ'],
      subtitle: 'Организуйте, ищите и управляйте своими знаниями без усилий благодаря интеллектуальным функциям на базе ИИ.',
      launchApp: 'Запустить приложение',
      learnMore: 'Узнать больше',
      documentsIndexed: 'Документов проиндексировано',
      uptime: 'Время безотказной работы',
      avgSearch: 'Сред. время поиска'
    },
    // Hero Cards
    heroCards: {
      knowledgeBase: 'База знаний',
      smartSearch: 'Умный поиск',
      aiInsights: 'Аналитика ИИ'
    },
    // Product Features
    product: {
      title: 'Мощные возможности',
      subtitle: 'Все, что вам нужно для эффективного управления знаниями',
      features: [
        {
          title: 'База знаний',
          description: 'Загружайте, организуйте и управляйте документами в нескольких форматах без усилий'
        },
        {
          title: 'Умный поиск',
          description: 'Поиск на базе ИИ находит именно то, что вам нужно, за миллисекунды'
        },
        {
          title: 'Аналитика ИИ',
          description: 'Автоматически создавайте резюме и извлекайте ключевую информацию'
        },
        {
          title: 'Аналитика',
          description: 'Отслеживайте закономерности использования и оптимизируйте базу знаний'
        },
        {
          title: 'Контроль доступа',
          description: 'Безопасность на основе ролей защищает конфиденциальную информацию'
        },
        {
          title: 'Высокая производительность',
          description: 'Молниеносная обработка с оптимизированной индексацией'
        }
      ]
    },
    // Team Section
    team: {
      title: 'Познакомьтесь с командой',
      subtitle: 'Талантливые люди, создающие удивительные технологии',
      members: [
        {
          name: 'Иван Афанасьев',
          role: 'Ведущий разработчик',
          bio: 'Разработка и поддержка программного обеспечения и алгоритмов поиска'
        },
        {
          name: 'Безнощенко Виктория',
          role: 'Операционный директор',
          bio: 'Операционная деятельность и внутренние процессы'
        },
        {
          name: 'Ермалкевич Илья',
          role: 'CEO',
          bio: 'Управление бизнес процессами и стратегическим планированием'
        }
      ]
    },
    // Goals Section
    goals: {
      title: 'Наша миссия',
      subtitle: 'Революционизация управления знаниями в организациях',
      items: [
        {
          title: 'Демократизировать знания',
          description: 'Сделать мощный ИИ доступным для всех организаций'
        },
        {
          title: 'Повысить производительность',
          description: 'Сократить время поиска и сосредоточиться на высокоценной работе'
        },
        {
          title: 'Способствовать сотрудничеству',
          description: 'Содействовать обмену знаниями между командами'
        },
        {
          title: 'Стимулировать инновации',
          description: 'Ускорить рост с помощью коллективного интеллекта'
        }
      ]
    },
    // Contact Section
    contact: {
      title: 'Свяжитесь с нами',
      subtitle: 'Мы будем рады услышать от вас',
      items: [
        {
          title: 'Электронная почта',
          text: 'info.wikiai@gmail.com'
        },
        {
          title: 'Phone',
          text: '+375297345682'
        },
        {
          title: 'Telegram',
          text: '@vikigolubeva'
        },
        {
          title: 'Поддержка',
          text: 'Получить поддержку в приложении'
        }
      ]
    },
    // Footer
    footer: {
      copyright: '© 2025 WikiAi. Все права защищены.',
      product: 'Продукт',
      team: 'Команда',
      goals: 'Цели',
      contact: 'Контакты'
    },
    // Navigation & Sidebar
    nav: {
      home: 'Главная',
      files: 'Файлы',
      search: 'Поиск',
      about: 'О нас',
      admin: 'Админ',
      loadingSession: 'Загрузка сессии...',
      toggleMenu: 'Переключить меню',
      language: 'Язык',
      selectLanguage: 'Выберите язык',
      english: 'Английский',
      russian: 'Русский',
      switchToEnglish: 'Переключить на английский',
      switchToRussian: 'Переключить на русский'
    },
    // Files Page
    files: {
      title: 'Файлы',
      subtitle: 'Просмотр и управление библиотекой документов',
      searchPlaceholder: 'Поиск файлов...',
      allTypes: 'Все типы',
      documents: 'Документы',
      images: 'Изображения',
      pdfs: 'PDF файлы',
      newestFirst: 'Новое вперед',
      oldestFirst: 'Старое вперед',
      loading: 'Загрузка...',
      filesCount: 'файлов',
      lastUpdated: 'Последнее обновление:',
      download: 'Скачать',
      quiz: 'Викторина !',
      share: 'Поделиться',
      delete: 'Удалить',
      noFiles: 'Файлы не найдены'
    },
    // Search Page
    search: {
      title: 'Поиск',
      subtitle: 'Найдите знания мгновенно с помощью поиска на базе ИИ',
      searchPlaceholder: 'Введите ваш запрос...',
      search: 'Поиск',
      results: 'Результаты поиска',
      noResults: 'Результатов не найдено',
      relevance: 'Релевантность'
    },
    // Admin Panel
    admin: {
      title: 'Панель администратора',
      users: 'Пользователи',
      analytics: 'Аналитика',
      settings: 'Настройки',
      logs: 'Логи',
      manageUsers: 'Управлять пользователями',
      viewAnalytics: 'Просмотр аналитики',
      systemSettings: 'Системные настройки',
      viewLogs: 'Просмотр логов',
      addUser: 'Добавить пользователя',
      editUser: 'Редактировать пользователя',
      deleteUser: 'Удалить пользователя',
      username: 'Имя пользователя',
      email: 'Электронная почта',
      role: 'Роль',
      admin: 'Администратор',
      user: 'Пользователь',
      editor: 'Редактор',
      active: 'Активно',
      inactive: 'Неактивно',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      close: 'Закрыть',
      confirm: 'Подтвердить',
      confirmDelete: 'Вы уверены, что хотите удалить этого пользователя?',
      noUsers: 'Пользователи не найдены',
      createFirstUser: 'Создайте первого пользователя, чтобы начать работу',
      autoRefreshOn: 'Автообновление ВКЛ',
      autoRefreshOff: 'Автообновление ВЫКЛ',
      reportsTitle: 'Отчеты и аналитика',
      totalReports: 'Всего отчетов',
      autoReports: 'Автоотчеты',
      manualReports: 'Ручные отчеты',
      automaticReportsTab: 'Автоматические',
      manualReportsTab: 'Ручные',
      automaticReportsHeader: 'Автоматические системные отчеты',
      automaticReportsDesc: 'Отчеты, автоматически сгенерированные системой для мониторинга безопасности, доступа и состояния системы.',
      noAutomaticReports: 'Нет автоматических отчетов',
      noAutomaticReportsDesc: 'Система работает стабильно, автоматических отчетов нет.',
      manualReportsHeader: 'Отчеты пользователей',
      manualReportsDesc: 'Отчеты, отправленные пользователями по проблемам, запросам функций или общей обратной связи.',
      noManualReports: 'Нет ручных отчетов',
      noManualReportsDesc: 'Пользователи еще не отправили отчеты.',
      systemAdminTitle: 'Администрирование системы',
      systemOnline: 'Система онлайн',
      systemOperations: 'Операции системы',
      systemOperationsDesc: 'Управление данными системы и обновление информации',
      autoRefreshLabel: 'Автообновление',
      updateEvery: 'Обновлять каждые',
      lastUpdates: 'Последние обновления',
      testApi: 'Тестировать API',
      test: 'Тест',
      apiDocsTitle: 'Документация API',
      apiDocsDesc: 'Доступные конечные точки и их использование',
      // Additional translations for admin dashboard
      lastLogin: 'Последний вход',
      filesAccess: 'Доступ к файлам',
      actions: 'Действия',
      adminBadge: 'Администратор',
      never: 'Никогда',
      edit: 'Редактировать',
      deleteBtn: 'Удалить',
      createNewUser: 'Создать нового пользователя',
      password: 'Пароль',
      filePermissions: 'Разрешения файлов',
      filesAccessible: 'файлов будут доступны',
      of: 'из',
      allFiles: 'Все файлы',
      fullAccess: 'Полный доступ',
      selectFiles: 'Выбрать файлы',
      customAccess: 'Пользовательский доступ',
      searchFiles: 'Поиск файлов...',
      all: 'Все',
      none: 'Нет',
      createUser: 'Создать пользователя',
      fileManagement: 'Управление файлами',
      uploadFile: 'Загрузить файл',
      enterFile: 'Ввести файл',
      dragDropFiles: 'Перетащите файлы сюда',
      browseFiles: 'обзор файлов',
      filename: 'Имя файла',
      fileContent: 'Содержание файла',
      submitFile: 'Отправить файл',
      file: 'Файл',
      type: 'Тип',
      size: 'Размер',
      uploaded: 'Загружено',
      preview: 'Предпросмотр',
      fileAccessDetails: 'Детали доступа к файлам',
      fullAccessToAll: 'Полный доступ ко всем файлам (включая будущие загрузки)',
      noFileAccess: 'Доступ к файлам не предоставлен',
      noFilesFound: 'Файлы не найдены',
      tryAdjustingSearch: 'Попробуйте изменить условия поиска',
      noFilesAvailable: 'Нет доступных файлов',
      noFilesMatch: 'Файлы не совпадают',
      cannotDeleteAdmin: 'Невозможно удалить пользователя администратора',
      hidePassword: 'Скрыть пароль',
      showPassword: 'Показать пароль'
    },
    // Login
    login: {
      title: 'Добро пожаловать в WikiAi',
      subtitle: 'Войдите в свой аккаунт',
      username: 'Имя пользователя',
      password: 'Пароль',
      login: 'Вход',
      loginError: 'Неверное имя пользователя или пароль',
      loggingIn: 'Вход...',
      apiUrl: 'API URL',
      apiUrlPlaceholder: 'http://localhost:9001',
      rememberMe: 'Запомнить меня',
      proxyWarning: 'Используется прокси — задайте VITE_API_PROXY в .env',
      selectServer: 'Выберите сохранённый сервер',
      noSavedServers: 'Сохранённых серверов пока нет',
      viewServerAddress: 'Показать адрес сервера',
      hideServerAddress: 'Скрыть адрес сервера',
      serverPanelTitle: 'Настройки подключения',
      serverPanelSubtitle: 'Обновите или используйте сохранённый адрес API'
    },
    // Common
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      close: 'Закрыть',
      confirm: 'Подтвердить',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успех',
      warning: 'Предупреждение',
      back: 'Назад',
      share: 'Поделиться',
      edit: 'Редактировать',
      open: 'Открыть',
      download: 'Скачать',
      or: 'или'
    }
  }
}

export function useI18n(language = 'en') {
  return translations[language] || translations.en
}
