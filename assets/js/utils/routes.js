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
        'class': (new AboutController),
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
        'method': 'list',
        'loader': 'list_loader',
    },
    {
        'route': 'add',
        'class': (new ExecutableController),
        'method': 'list',
        'loader': 'list_loader',
        'args': {
            'cx': 'add',
        }
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
    {
        'route': 'not_found',
        'class': (new AboutController),
        'method': 'not_found'
    },
]

export default routes
