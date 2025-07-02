import AboutController from "../controllers/AboutController.js"
import ContentController from "../controllers/ContentController.js"
import ExecutableController from "../controllers/ExecutableController.js"

export const routes = [
    {
        'route': 'index',
        'class': (new AboutController),
        'method': 'main'
    },
    {
        'route': 'stat',
        'class': (new ExecutableController),
        'method': 'stat'
    },
    {
        'route': 'content',
        'class': (new ContentController),
        'method': 'main'
    },
    {
        'route': 'cu',
        'class': (new ContentController),
        'method': 'page'
    },
    {
        'route': 'exec',
        'class': (new ExecutableController),
        'method': 'list'
    },
    {
        'route': 'execute',
        'class': (new ExecutableController),
        'method': 'executable'
    },
    {
        'route': 'test',
        'class': (new AboutController),
        'method': 'test'
    },
]

export default routes
