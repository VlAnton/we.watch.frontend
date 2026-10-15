import './AuthModal.scss'

import { loginUser, registerUser, User } from '@/api/auth'
import { createInputField, InputFieldInstance } from '@/components/Input/Input'

import { createBaseModal } from '../BaseModal/BaseModal'
import templateHtml from './AuthModal.html?raw'

interface AuthPageProps {
  onSuccess: (user: User) => void
  onError: (message: string) => void
}

type AuthMode = 'login' | 'register'

function toggleUsernameField(
  usernameWrapper: HTMLElement,
  usernameField: InputFieldInstance,
  show: boolean
) {
  if (show) {
    usernameWrapper.classList.remove('auth-modal__input-collapsible--collapsed')
    usernameField.input.required = true
  } else {
    usernameWrapper.classList.add('auth-modal__input-collapsible--collapsed')
    usernameField.input.required = false
    usernameField.clearError()
  }
}

function createUsernameField(): InputFieldInstance {
  const usernameField = createInputField({
    id: 'username',
    name: 'username',
    type: 'text',
    label: 'Имя пользователя',
    placeholder: 'ivan_ivanov',
    required: true
  })

  const usernameWrapper = document.createElement('div')
  usernameWrapper.className = 'auth-modal__input-collapsible'

  const usernameInner = document.createElement('div')
  usernameInner.className = 'auth-modal__input-collapsible-inner'
  usernameInner.appendChild(usernameField.element)
  usernameWrapper.appendChild(usernameInner)
  usernameField.element = usernameWrapper

  return usernameField
}

function setInputFields() {
  const usernameField = createUsernameField()

  const emailField = createInputField({
    id: 'email',
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'example@mail.com',
    required: true
  })

  const passwordField = createInputField({
    id: 'password',
    name: 'password',
    type: 'password',
    label: 'Пароль',
    placeholder: 'Минимум 6 символов',
    required: true
  })

  return {
    usernameField,
    emailField,
    passwordField
  }
}

export function createAuthModal(props: AuthPageProps) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(templateHtml, 'text/html')
  const modalRoot = doc.body.firstElementChild as HTMLElement

  if (!modalRoot) {
    throw new Error('Не удалось загрузить шаблон AuthPage')
  }

  const tabLoginBtn = modalRoot.querySelector('#login-tab') as HTMLButtonElement
  const tabRegisterBtn = modalRoot.querySelector('#register-tab') as HTMLButtonElement

  const form = modalRoot.querySelector('.auth-modal__form') as HTMLFormElement
  const fieldsContainer = form.querySelector('.auth-modal__inputs') as HTMLElement
  const submitBtn = form.querySelector('.auth-modal__submit-btn') as HTMLButtonElement

  let currentMode: AuthMode = 'login'

  const { usernameField, emailField, passwordField } = setInputFields()
  toggleUsernameField(usernameField.element, usernameField, false)
  fieldsContainer.appendChild(usernameField.element)
  fieldsContainer.appendChild(emailField.element)
  fieldsContainer.appendChild(passwordField.element)

  function switchMode(mode: AuthMode) {
    currentMode = mode
    usernameField.clearError()
    emailField.clearError()
    passwordField.clearError()

    if (mode === 'login') {
      tabLoginBtn.classList.add('auth-modal__tab--active')
      tabRegisterBtn.classList.remove('auth-modal__tab--active')

      submitBtn.textContent = 'Войти'

      toggleUsernameField(usernameField.element, usernameField, false)
    } else {
      tabLoginBtn.classList.remove('auth-modal__tab--active')
      tabRegisterBtn.classList.add('auth-modal__tab--active')

      submitBtn.textContent = 'Зарегистрироваться'
      toggleUsernameField(usernameField.element, usernameField, true)
    }
  }

  tabLoginBtn.addEventListener('click', () => switchMode('login'))
  tabRegisterBtn.addEventListener('click', () => switchMode('register'))

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    usernameField.clearError()
    emailField.clearError()
    passwordField.clearError()

    const usernameVal = usernameField.getValue()
    const emailVal = emailField.getValue()
    const passwordVal = passwordField.getValue()

    if (!emailVal) {
      emailField.setError('Заполните это поле')
    }

    if (!emailVal.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      emailField.setError('Email должен быть в формате user@domain.com')
    }

    if (!passwordVal) {
      passwordField.setError('Введите пароль')
    } else if (passwordVal.length < 6) {
      passwordField.setError('Минимум 6 символов')
    }

    if (currentMode === 'register' && usernameVal.length < 3) {
      usernameField.setError('Имя должно быть от 3 символов')
    }

    if (usernameField.hasErrors || emailField.hasErrors || passwordField.hasErrors) {
      return
    }

    submitBtn.disabled = true
    submitBtn.textContent = 'Загрузка...'

    try {
      let result
      if (currentMode === 'login') {
        result = await loginUser({ email: emailVal, password: passwordVal })
      } else {
        result = await registerUser({
          username: usernameVal,
          email: emailVal,
          password: passwordVal
        })
      }

      props.onSuccess(result.user)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка'
      props.onError(message)
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = currentMode === 'login' ? 'Войти' : 'Создать аккаунт'
    }
  })

  const baseModalEl = createBaseModal({
    content: modalRoot,
    closable: false,
    title: 'we.watch'
  })

  return baseModalEl
}
