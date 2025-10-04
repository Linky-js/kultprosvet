export const myMixin2 = {
    methods: {
        getThemeClass(theme) {

            switch (theme) {
                case "Музыка":
                    return "music";
                case "Живопись":
                    return "art";
                case "Литература":
                    return "literature";
                case "Спорт":
                    return "sport";
                case "Мода":
                    return "moda";
                case "Наука":
                    return "science";
                case "Лайф менеджмент":
                    return "lifestyle";
                case "История":
                    return "history";
                case "Архитектура":
                    return "architecture";
                case "Философия":
                    return "philosophy";
                case "Кино":
                    return "cinema";
                case "Урбанистика":
                    return "urbanism";
                default:
                    return "";
            }
        },
        getItemClass(item) {
            switch (item) {
                case "news":
                    return "news-item";
                case "podkast":
                    return "podcast-item";
                case "video":
                    return "video-item";
                default:
                    return "";
            }
        },
    }
}
export const myMixinColor = {
    methods: {
        getColorClass(theme) {
            switch (theme) {
                case "Музыка":
                    return "#5F22C1";
                case "Искусство":
                    return "art";
                case "Литература":
                    return "#EF8933";
                case "Спорт":
                    return "#2FA3E4";
                case "Мода":
                    return "#FD2E89";
                case "Наука":
                    return "#2A89FF";
                case "Лайф менеджмент":
                    return "#39945D";
                case "История":
                    return "history";
                default:
                    return "";
            }
        }
    }
}
