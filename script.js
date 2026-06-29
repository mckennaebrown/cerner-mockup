const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.screen');

function showScreen(targetId) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === targetId);
  });

  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.target === targetId);
  });

  const screen = document.getElementById(targetId);
  if (screen) {
    screen.scrollIntoView({ block: 'start', inline: 'nearest' });
  }
}

navItems.forEach((item) => {
  item.addEventListener('click', () => showScreen(item.dataset.target));
});

// Double-click to clear editable mockup fields.
document.querySelectorAll('input, textarea').forEach((field) => {
  field.addEventListener('dblclick', () => {
    if (field.type !== 'checkbox' && field.type !== 'radio' && !field.readOnly) {
      field.value = '';
    }
  });
});

// Keyboard navigation through the left menu.
document.addEventListener('keydown', (event) => {
  const activeIndex = Array.from(navItems).findIndex((item) => item.classList.contains('active'));

  if (event.altKey && event.key === 'ArrowDown') {
    event.preventDefault();
    const next = navItems[Math.min(activeIndex + 1, navItems.length - 1)];
    next?.click();
    next?.focus();
  }

  if (event.altKey && event.key === 'ArrowUp') {
    event.preventDefault();
    const previous = navItems[Math.max(activeIndex - 1, 0)];
    previous?.click();
    previous?.focus();
  }
});

function updateConditionalFields() {
  document.querySelectorAll('.conditional-field[data-conditional-group]').forEach((field) => {
    const group = field.dataset.conditionalGroup;
    const expectedValues = (field.dataset.conditionalValues || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const isActive = Array.from(document.querySelectorAll(`[name="${group}"]`)).some((control) => {
      return control.checked && expectedValues.includes(control.value);
    });

    field.hidden = !isActive;
  });
}

document.addEventListener('change', (event) => {
  if (event.target.matches('input[type="checkbox"], input[type="radio"]')) {
    updateConditionalFields();
  }
});

// Indigenous identity: one or more positive identities may be selected.
// “No,” “Do not know,” and “Prefer not to answer” are mutually exclusive.
document.querySelectorAll('[data-indigenous-positive], [data-indigenous-exclusive]').forEach((control) => {
  control.addEventListener('change', () => {
    const positiveChoices = document.querySelectorAll('[data-indigenous-positive]');
    const exclusiveChoices = document.querySelectorAll('[data-indigenous-exclusive]');

    if (control.matches('[data-indigenous-exclusive]') && control.checked) {
      positiveChoices.forEach((item) => { item.checked = false; });
      exclusiveChoices.forEach((item) => {
        if (item !== control) item.checked = false;
      });
    }

    if (control.matches('[data-indigenous-positive]') && control.checked) {
      exclusiveChoices.forEach((item) => { item.checked = false; });
    }
  });
});

// Ethnic or cultural origin search fields: add multiple selections as removable chips.
document.querySelectorAll('[data-multi-select]').forEach((control) => {
  const input = control.querySelector('input');
  const addButton = control.querySelector('.add-selection-button');
  const selectedValues = control.querySelector('.selected-values');

  function addSelection() {
    const value = input.value.trim();
    if (!value) return;

    const alreadyAdded = Array.from(selectedValues.querySelectorAll('.selected-value-chip'))
      .some((chip) => chip.dataset.value.toLowerCase() === value.toLowerCase());

    if (alreadyAdded) {
      input.focus();
      return;
    }

    const chip = document.createElement('span');
    chip.className = 'selected-value-chip';
    chip.dataset.value = value;
    chip.append(document.createTextNode(value));

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-selection-button';
    removeButton.setAttribute('aria-label', `Remove ${value}`);
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => chip.remove());

    chip.appendChild(removeButton);
    selectedValues.appendChild(chip);
    input.value = '';
    input.focus();
  }

  addButton.addEventListener('click', addSelection);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSelection();
    }
  });
});

updateConditionalFields();
