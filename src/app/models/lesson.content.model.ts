export interface LessonContentTable {
    title: string;
    columns: string[];
    data: string[][];
}

export interface Content
{
    title: string;
    paragraphs: string[];
    images: string[];
    tables?: LessonContentTable[] | null;
}
