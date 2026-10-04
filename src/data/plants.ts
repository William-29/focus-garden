export type Plant = {
    id: string;
    name: string;
    category: "flower" | "fruit" | "vegetable" | "herb";
    description: string;
    growTime: number;
    reward: number;
    image: string;
};  

export const plants: Plant[] = [
    {
        id: "daisy",
        name: "Daisy",
        category: "flower",
        description: "A beautiful white flower with a yellow center.",
        growTime: 10 * 60, // 10 minutes in seconds
        reward: 5,
        image: "/images/daisy.png",
    },
    {
        id: "rose",
        name: "Rose",
        category: "flower",
        description: "A classic red flower known for its beauty and fragrance.",
        growTime: 15 * 60, // 15 minutes in seconds
        reward: 10,
        image: "/images/rose.png",
    },
    {
        id: "tulip",
        name: "Tulip",
        category: "flower",
        description: "A vibrant spring flower with a cup-shaped bloom.",
        growTime: 12 * 60, // 12 minutes in seconds
        reward: 8,
        image: "/images/tulip.png",
    },
    {
        id: "lavender",
        name: "Lavender",
        category: "herb",
        description: "A fragrant plant used in aromatherapy and cooking.",
        growTime: 20 * 60, // 20 minutes in seconds
        reward: 15,
        image: "/images/lavender.png",
    },
    {
        id: "basil",
        name: "Basil",
        category: "herb",
        description: "A popular herb used in cooking, especially in Italian cuisine.",
        growTime: 18 * 60, // 18 minutes in seconds
        reward: 12,
        image: "/images/basil.png",
    },
    {
        id: "carrot",
        name: "Carrot",
        category: "vegetable",
        description: "A root vegetable that is typically orange in color.",
        growTime: 25 * 60, // 25 minutes in seconds
        reward: 15,
        image: "/images/carrot.png",
    },
    {
        id: "sunflower",
        name: "Sunflower",
        category: "flower",
        description: "A tall plant with large, yellow flowers.",
        growTime: 20 * 60, // 20 minutes in seconds
        reward: 15,
        image: "/images/sunflower.png",
    },
];