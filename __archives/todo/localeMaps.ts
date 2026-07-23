export type TranslationMap = Readonly<Record<string, string>>;

/**
 * Bundled locale strings embedded for single-file release binaries.
 */
export const localeMaps = {
	"de": {
		"_meta.notes": "Auto-translated draft. Native-speaker review welcome via PR. Unicode box-drawing characters (──) stay untranslated. Note: 'overlay.more' renders as '+5 weitere' which is grammatically loose for plural agreement — accepted for badge brevity.",
		"status.pending": "ausstehend",
		"status.in_progress": "in Bearbeitung",
		"status.completed": "erledigt",
		"status.deleted": "gelöscht",
		"overlay.heading": "Todos",
		"overlay.more": "weitere",
		"command.no_todos": "Noch keine Todos. Bitte den Agenten, welche hinzuzufügen!",
		"command.requires_interactive": "/todos erfordert den interaktiven Modus",
		"command.section.pending": "── Ausstehend ──",
		"command.section.in_progress": "── In Bearbeitung ──",
		"command.section.completed": "── Erledigt ──"
	},
	"en": {
		"status.pending": "pending",
		"status.in_progress": "in progress",
		"status.completed": "completed",
		"status.deleted": "deleted",
		"overlay.heading": "Todos",
		"overlay.more": "more",
		"command.no_todos": "No todos yet. Ask the agent to add some!",
		"command.requires_interactive": "/todos requires interactive mode",
		"command.section.pending": "── Pending ──",
		"command.section.in_progress": "── In Progress ──",
		"command.section.completed": "── Completed ──"
	},
	"es": {
		"_meta.notes": "Auto-translated draft. Native-speaker review welcome via PR. Unicode box-drawing characters (──) stay untranslated.",
		"status.pending": "pendientes",
		"status.in_progress": "en curso",
		"status.completed": "completadas",
		"status.deleted": "eliminada",
		"overlay.heading": "Tareas",
		"overlay.more": "más",
		"command.no_todos": "Sin tareas aún. ¡Pídele al agente que añada algunas!",
		"command.requires_interactive": "/todos requiere modo interactivo",
		"command.section.pending": "── Pendientes ──",
		"command.section.in_progress": "── En curso ──",
		"command.section.completed": "── Completadas ──"
	},
	"fr": {
		"_meta.notes": "Auto-translated draft. Native-speaker review welcome via PR. Unicode box-drawing characters (──) stay untranslated.",
		"status.pending": "en attente",
		"status.in_progress": "en cours",
		"status.completed": "terminées",
		"status.deleted": "supprimée",
		"overlay.heading": "Tâches",
		"overlay.more": "autres",
		"command.no_todos": "Pas encore de tâches. Demandez à l'agent d'en ajouter !",
		"command.requires_interactive": "/todos nécessite le mode interactif",
		"command.section.pending": "── En attente ──",
		"command.section.in_progress": "── En cours ──",
		"command.section.completed": "── Terminées ──"
	},
	"pt": {
		"_meta.notes": "Auto-translated draft. Native-speaker review welcome via PR. Unicode box-drawing characters (──) stay untranslated.",
		"status.pending": "pendentes",
		"status.in_progress": "em curso",
		"status.completed": "concluídas",
		"status.deleted": "eliminada",
		"overlay.heading": "Tarefas",
		"overlay.more": "mais",
		"command.no_todos": "Sem tarefas ainda. Peça ao agente para adicionar algumas!",
		"command.requires_interactive": "/todos requer modo interativo",
		"command.section.pending": "── Pendentes ──",
		"command.section.in_progress": "── Em curso ──",
		"command.section.completed": "── Concluídas ──"
	},
	"pt-BR": {
		"_meta.notes": "Auto-translated draft. Native-speaker review welcome via PR. Unicode box-drawing characters (──) stay untranslated.",
		"status.pending": "pendentes",
		"status.in_progress": "em andamento",
		"status.completed": "concluídas",
		"status.deleted": "excluída",
		"overlay.heading": "Tarefas",
		"overlay.more": "mais",
		"command.no_todos": "Nenhuma tarefa ainda. Peça ao agente para adicionar algumas!",
		"command.requires_interactive": "/todos requer modo interativo",
		"command.section.pending": "── Pendentes ──",
		"command.section.in_progress": "── Em andamento ──",
		"command.section.completed": "── Concluídas ──"
	},
	"ru": {
		"_meta.notes": "Автоперевод. Приветствуется проверка носителем языка через PR. Символы юникода (──) не переводятся.",
		"status.pending": "ожидание",
		"status.in_progress": "в работе",
		"status.completed": "выполнено",
		"status.deleted": "удалена",
		"overlay.heading": "Задачи",
		"overlay.more": "ещё",
		"command.no_todos": "Задач пока нет. Попросите агента добавить!",
		"command.requires_interactive": "/todos требует интерактивного режима",
		"command.section.pending": "── Ожидание ──",
		"command.section.in_progress": "── В работе ──",
		"command.section.completed": "── Выполнено ──"
	},
	"uk": {
		"_meta.notes": "Автопереклад. Привітна перевірка носієм мови через PR. Символи юнікоду (──) не перекладаються.",
		"status.pending": "очікування",
		"status.in_progress": "у роботі",
		"status.completed": "виконано",
		"status.deleted": "видалено",
		"overlay.heading": "Завдання",
		"overlay.more": "ще",
		"command.no_todos": "Завдань поки немає. Попросіть агента додати!",
		"command.requires_interactive": "/todos потребує інтерактивного режиму",
		"command.section.pending": "── Очікування ──",
		"command.section.in_progress": "── У роботі ──",
		"command.section.completed": "── Виконано ──"
	}
} as const satisfies Record<string, TranslationMap>;
