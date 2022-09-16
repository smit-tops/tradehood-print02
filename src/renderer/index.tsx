import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import Context from './components/Context';
const container = document.getElementById('root')!;
const root = createRoot(container);
import { ErrorBoundary } from './components/ErrrorBoundary';

root.render(
    <Context>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </Context>
);
