import { toolList, type ToolId } from "./catalog.js";

function slugifySegment(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .replace(/-{2,}/gu, "-");
}

function buildToolPath(toolId: ToolId, label: string, usedPaths: Set<string>) {
  const baseSlug = slugifySegment(label) || slugifySegment(toolId) || toolId;
  let slug = baseSlug;
  let collisionIndex = 2;

  while (usedPaths.has(`/${slug}`)) {
    slug = `${baseSlug}-${collisionIndex}`;
    collisionIndex += 1;
  }

  const path = `/${slug}`;
  usedPaths.add(path);
  return path;
}

const usedPaths = new Set<string>();

const toolPathEntries = toolList.map((tool) => {
  const path = buildToolPath(tool.id as ToolId, tool.label, usedPaths);
  return {
    toolId: tool.id as ToolId,
    path
  };
});

export const toolPathById = Object.freeze(
  Object.fromEntries(toolPathEntries.map((entry) => [entry.toolId, entry.path])) as Record<ToolId, string>
);

export const toolIdByPath = Object.freeze(
  Object.fromEntries(toolPathEntries.map((entry) => [entry.path, entry.toolId])) as Record<string, ToolId>
);

export function getToolPath(toolId: ToolId) {
  return toolPathById[toolId];
}

export function getLegacyToolPath(toolId: ToolId) {
  return `/ferramenta/${encodeURIComponent(toolId)}`;
}

export function getToolIdFromPath(pathname: string) {
  const normalized = pathname.replace(/\/+$/u, "") || "/";
  return toolIdByPath[normalized] ?? null;
}

export function getToolPathEntries() {
  return toolPathEntries.slice();
}
