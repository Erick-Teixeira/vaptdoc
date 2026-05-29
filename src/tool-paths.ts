import { toolList, type ToolDefinition, type ToolId } from "./catalog.js";

function slugifyLabel(label: string) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/&/gu, " e ")
    .replace(/\+/gu, " plus ")
    .replace(/[()/]/gu, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-|-$/gu, "");
}

function buildPreferredSlug(tool: ToolDefinition) {
  return slugifyLabel(tool.label || tool.id);
}

const pathEntries = (() => {
  const seen = new Set<string>();

  return toolList.map((tool) => {
    const preferredSlug = buildPreferredSlug(tool);
    let slug = preferredSlug || slugifyLabel(tool.id) || tool.id;

    if (seen.has(slug)) {
      slug = `${slug}-${slugifyLabel(tool.id)}`;
    }

    seen.add(slug);
    return [tool.id as ToolId, `/${slug}`] as const;
  });
})();

export const toolPathById = Object.fromEntries(pathEntries) as Record<ToolId, string>;
export const toolIdByPath = Object.fromEntries(pathEntries.map(([toolId, pathname]) => [pathname, toolId])) as Record<string, ToolId>;

export function getToolPath(toolId: ToolId) {
  return toolPathById[toolId];
}

export function getToolIdFromPath(pathname: string) {
  return toolIdByPath[pathname] ?? null;
}

export function getToolPathEntries() {
  return [...pathEntries];
}

export function getLegacyToolPath(toolId: ToolId) {
  return `/ferramenta/${encodeURIComponent(toolId)}`;
}
