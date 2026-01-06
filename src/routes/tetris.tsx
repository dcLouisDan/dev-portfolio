import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/tetris')({
    component: RouteComponent,
})

function RouteComponent() {
    return (<div className="w-full h-screen">
        <iframe
            src="/tetris/index.html"
            className="w-full h-full border-0"
            title="Tetris Demo"
        />
    </div>)
}
