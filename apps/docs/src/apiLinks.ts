type SidebarItem = {
  type: string;
  id?: string;
  label?: string;
  items?: SidebarItem[];
};

const sidebar = require('../docs/api/typedoc-sidebar.cjs') as SidebarItem[];

const apiLinks = new Map<string, string>();

function collectLinks(items: SidebarItem[]) {
  for (const item of items) {
    if (item.type === 'doc' && item.id && item.label) {
      apiLinks.set(item.label, `/${item.id}`);
    }
    if (item.items) collectLinks(item.items);
  }
}

collectLinks(sidebar);

export default apiLinks;
