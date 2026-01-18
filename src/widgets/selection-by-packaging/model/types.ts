export type PackagingCard = {
  id: number;
  title: string;
  description: string;
  imagePath: string;
  link: string;
};

export type PackagingGroup = {
  id: number;
  title: string;
  cards: PackagingCard[];
};

export type PackagingTab = {
  id: number;
  label: string;
  groupId: number;
};
