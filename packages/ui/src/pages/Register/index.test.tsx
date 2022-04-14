import { render } from '@testing-library/react';
import React from 'react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';

import Register from '@/pages/Register';

jest.mock('@/apis/register', () => ({ register: jest.fn(async () => Promise.resolve()) }));

describe('<Register />', () => {
  test('renders without exploding', async () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/register']}>
        <Register />
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).not.toBeNull();
    expect(queryByText('action.create')).not.toBeNull();
  });

  test('renders phone', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/register/sms']}>
        <Routes>
          <Route path="/register/:method" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).not.toBeNull();
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
  });

  test('renders email', async () => {
    const { queryByText, container } = render(
      <MemoryRouter initialEntries={['/register/email']}>
        <Routes>
          <Route path="/register/:method" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('action.create_account')).not.toBeNull();
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
  });
});
