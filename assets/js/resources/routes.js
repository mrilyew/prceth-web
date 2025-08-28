import AboutController from "../controllers/AboutController.js"
import ExecutableController from "../controllers/ExecutableController.js"

export const routes = [
    {
        'route': 'index',
        'class': (new AboutController),
        'method': 'main'
    },
    {
        'route': 'not_found',
        'class': (new AboutController),
        'method': 'not_found'
    },
    {
        'route': 'executablesList',
        'class': (new ExecutableController),
        'method': 'executables_list'
    },
    {
        'route': 'executable',
        'class': (new ExecutableController),
        'method': 'executable_page'
    },
]

export default routes
