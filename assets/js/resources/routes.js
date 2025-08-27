import AboutController from "../controllers/AboutController.js"

export const routes = [
    {
        'route': 'index',
        'class': (new AboutController),
        'method': 'main'
    },
]

export default routes
