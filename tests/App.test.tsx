import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import App from '../src/App';

const renderApp = (initialRoute: string = '/'): ReturnType<typeof render> => {
    window.history.pushState({}, '', initialRoute);
    return render(<App />);
};

describe('App', () => {
    test('should render', () => {
        renderApp();
    });
});
