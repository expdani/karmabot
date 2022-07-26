/**
 * Random number between min and max.
 */
export function randomInt(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Disable all buttons in a message.
 */
export async function disableAllButtons(message: any) {
  const components: any = [];
  for (const actionRow of message.components) {
    components.push({ type: actionRow.type, components: [] });
    for (const button of actionRow.components) {
      components[components.length - 1].components.push({
        type: button.type,
        label: button.label,
        style: button.style,
        customId: button.customId,
        disabled: true,
      });
    }
  }

  await message.edit({
    components: components,
  });
}

/**
 * Enable all buttons in a message.
 */
export async function enableAllButtons(message: any) {
  const components: any = [];
  for (const actionRow of message.components) {
    components.push({ type: actionRow.type, components: [] });
    for (const button of actionRow.components) {
      components[components.length - 1].components.push({
        type: button.type,
        label: button.label,
        style: button.style,
        customId: button.customId,
        disabled: false,
      });
    }
  }

  await message.edit({
    components: components,
  });
}
