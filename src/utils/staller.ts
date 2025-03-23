export async function stall(stallTime = 1000) {
  await new Promise((resolve) => setTimeout(resolve, stallTime));
}
