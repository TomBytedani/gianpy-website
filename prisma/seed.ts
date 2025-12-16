import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// R2 Public URL for images
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-c08ae0de86f94e598029df0900cc46b3.r2.dev';

async function main() {
    console.log('🌱 Starting database seed...');
    console.log(`📷 Using R2 URL: ${R2_PUBLIC_URL}`);

    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: 'cassettoni' },
            update: {},
            create: {
                name: 'cassettoni',
                displayName: 'Cassettoni e Comò',
                displayNameEn: 'Chests and Dressers',
                description: 'Eleganti cassettoni e comò d\'epoca',
                sortOrder: 1,
            },
        }),
        prisma.category.upsert({
            where: { name: 'specchiere' },
            update: {},
            create: {
                name: 'specchiere',
                displayName: 'Specchiere',
                displayNameEn: 'Mirrors',
                description: 'Specchiere e cornici decorative',
                sortOrder: 2,
            },
        }),
        prisma.category.upsert({
            where: { name: 'tavoli' },
            update: {},
            create: {
                name: 'tavoli',
                displayName: 'Tavoli e Consolle',
                displayNameEn: 'Tables and Consoles',
                description: 'Tavoli, consolle e tavolini d\'epoca',
                sortOrder: 3,
            },
        }),
        prisma.category.upsert({
            where: { name: 'sedie' },
            update: {},
            create: {
                name: 'sedie',
                displayName: 'Sedie e Poltrone',
                displayNameEn: 'Chairs and Armchairs',
                description: 'Sedute d\'epoca e poltrone eleganti',
                sortOrder: 4,
            },
        }),
        prisma.category.upsert({
            where: { name: 'credenze' },
            update: {},
            create: {
                name: 'credenze',
                displayName: 'Credenze e Madie',
                displayNameEn: 'Sideboards and Cupboards',
                description: 'Credenze, madie e mobili contenitori',
                sortOrder: 5,
            },
        }),
    ]);

    console.log(`✓ Created ${categories.length} categories`);

    // Create sample products with images
    const productsData = [
        {
            title: 'Cassettone Luigi XVI in Noce',
            titleEn: 'Louis XVI Walnut Chest of Drawers',
            slug: 'cassettone-luigi-xvi-noce',
            description: 'Elegante cassettone in stile Luigi XVI realizzato in noce massello con intarsi in bois de rose. Presenta tre cassetti con maniglie in bronzo dorato originali. Piano in marmo. Provenienza: collezione privata toscana. Restauro conservativo eseguito nel nostro laboratorio.',
            descriptionEn: 'Elegant Louis XVI style chest of drawers made of solid walnut with bois de rose inlays. Features three drawers with original gilded bronze handles. Marble top. Provenance: private Tuscan collection. Conservative restoration carried out in our workshop.',
            price: 4200,
            dimensions: '125 x 65 x 90 cm',
            materials: 'Noce, bois de rose, marmo, bronzo dorato',
            condition: 'Eccellente - restauro conservativo',
            provenance: 'Collezione privata, Toscana',
            categoryName: 'cassettoni',
            isFeatured: true,
            image: `${R2_PUBLIC_URL}/product1.png`,
        },
        {
            title: 'Specchiera Impero Dorata',
            titleEn: 'Empire Gilded Mirror',
            slug: 'specchiera-impero-dorata',
            description: 'Magnifica specchiera in stile Impero con cornice intagliata e dorata a foglia oro. Cimasa decorata con motivi a palmetta e volute. Specchio originale con leggere ossidazioni che ne attestano l\'autenticità. Pezzo di grande impatto decorativo.',
            descriptionEn: 'Magnificent Empire style mirror with carved and gold leaf gilded frame. Pediment decorated with palmette and scroll motifs. Original mirror with slight oxidation attesting to its authenticity. A piece of great decorative impact.',
            price: 3800,
            dimensions: '180 x 95 cm',
            materials: 'Legno intagliato, foglia oro, specchio mercurio',
            condition: 'Ottimo - doratura originale',
            provenance: 'Palazzo nobiliare, Piemonte',
            categoryName: 'specchiere',
            isFeatured: true,
            image: `${R2_PUBLIC_URL}/product2-specchiera.png`,
        },
        {
            title: 'Tavolo Ottocento in Mogano',
            titleEn: '19th Century Mahogany Table',
            slug: 'tavolo-ottocento-mogano',
            description: 'Elegante tavolo da pranzo allungabile in mogano cubano con gambe a balaustro tornito. Due prolunghe originali permettono di estendere la superficie da 6 a 10 posti. Piano lastronato con venatura a specchio.',
            descriptionEn: 'Elegant extendable dining table in Cuban mahogany with turned baluster legs. Two original extensions allow the surface to be extended from 6 to 10 seats. Veneered top with book-matched grain.',
            price: 5600,
            dimensions: '200/300 x 110 x 78 cm',
            materials: 'Mogano cubano massello e lastronato',
            condition: 'Molto buono - lucidatura a tampone',
            provenance: 'Villa privata, Lombardia',
            categoryName: 'tavoli',
            isFeatured: true,
            image: `${R2_PUBLIC_URL}/product3-tavolo.png`,
        },
        {
            title: 'Poltrona Napoleone III in Velluto',
            titleEn: 'Napoleon III Velvet Armchair',
            slug: 'poltrona-napoleone-iii-velluto',
            description: 'Raffinata poltrona in stile Napoleone III con struttura in legno ebanizzato e intagli dorati. Imbottitura originale restaurata, rivestita in velluto di seta color bordeaux. Seduta molto confortevole.',
            descriptionEn: 'Refined Napoleon III style armchair with ebonized wood frame and gilded carvings. Original padding restored, upholstered in burgundy silk velvet. Very comfortable seating.',
            price: 2400,
            dimensions: '70 x 65 x 95 cm (seduta 45 cm)',
            materials: 'Legno ebanizzato, velluto di seta, imbottitura in crine',
            condition: 'Eccellente - imbottitura restaurata',
            provenance: 'Antiquariato francese',
            categoryName: 'sedie',
            isFeatured: false,
            image: `${R2_PUBLIC_URL}/product4-poltrona.png`,
        },
        {
            title: 'Credenza Toscana Rinascimentale',
            titleEn: 'Tuscan Renaissance Sideboard',
            slug: 'credenza-toscana-rinascimentale',
            description: 'Imponente credenza toscana in noce massello con fronte a due ante intagliate a motivi rinascimentali. Cassetto centrale con tiranti in ferro battuto originali. Base a zampe leonine.',
            descriptionEn: 'Imposing Tuscan sideboard in solid walnut with two doors carved with Renaissance motifs. Central drawer with original wrought iron pulls. Base with lion paw feet.',
            price: 7200,
            dimensions: '190 x 60 x 110 cm',
            materials: 'Noce massello, ferro battuto',
            condition: 'Buono - patina originale',
            provenance: 'Proprietà ecclesiastica, Siena',
            categoryName: 'credenze',
            isFeatured: true,
            image: `${R2_PUBLIC_URL}/product5-credenza.png`,
        },
        {
            title: 'Consolle Carlo X in Acero',
            titleEn: 'Charles X Maple Console',
            slug: 'consolle-carlo-x-acero',
            description: 'Delicata consolle in stile Carlo X realizzata in acero occhiato con intarsi in amaranto. Piano in marmo bianco di Carrara originale. Gambe anteriori a colonna con capitelli in bronzo dorato.',
            descriptionEn: 'Delicate Charles X style console in bird\'s eye maple with amaranth inlays. Original white Carrara marble top. Front legs as columns with gilded bronze capitals.',
            price: 3200,
            dimensions: '110 x 45 x 85 cm',
            materials: 'Acero occhiato, amaranto, marmo, bronzo dorato',
            condition: 'Ottimo - restauro conservativo',
            provenance: 'Collezione privata, Emilia-Romagna',
            categoryName: 'tavoli',
            isFeatured: false,
            image: `${R2_PUBLIC_URL}/product3-tavolo.png`, // Reusing image
        },
        {
            title: 'Comò Veneziano Laccato',
            titleEn: 'Venetian Lacquered Chest',
            slug: 'como-veneziano-laccato',
            description: 'Comò bombato in stile veneziano con laccatura policroma originale su fondo avorio. Decorazioni floreali e paesaggi alla maniera di Tiepolo. Piano in marmo rosa del Portogallo.',
            descriptionEn: 'Bombe chest in Venetian style with original polychrome lacquer on ivory background. Floral decorations and landscapes in the manner of Tiepolo. Portuguese pink marble top.',
            price: 5800,
            dimensions: '130 x 58 x 92 cm',
            materials: 'Legno laccato, marmo rosa del Portogallo',
            condition: 'Buono - lacca originale con normale usura',
            provenance: 'Palazzo veneziano',
            categoryName: 'cassettoni',
            isFeatured: true,
            image: `${R2_PUBLIC_URL}/product1.png`, // Reusing image
        },
        {
            title: 'Coppia Sedie Chiavarine',
            titleEn: 'Pair of Chiavari Chairs',
            slug: 'coppia-sedie-chiavarine',
            description: 'Elegante coppia di sedie Chiavarine in legno di ciliegio con seduta in paglia di Vienna intrecciata a mano. Schienale traforato con motivo a lira. Produzione ligure di pregio.',
            descriptionEn: 'Elegant pair of Chiavari chairs in cherry wood with hand-woven Vienna straw seat. Openwork backrest with lyre motif. Fine Ligurian production.',
            price: 1800,
            dimensions: '45 x 45 x 95 cm (ciascuna)',
            materials: 'Ciliegio, paglia di Vienna',
            condition: 'Molto buono - impagliatura restaurata',
            provenance: 'Antiquariato ligure',
            categoryName: 'sedie',
            isFeatured: false,
            status: 'RESERVED' as const,
            image: `${R2_PUBLIC_URL}/product4-poltrona.png`, // Reusing image
        },
    ];

    for (const productData of productsData) {
        const category = categories.find(c => c.name === productData.categoryName);

        // Check if product already exists
        const existingProduct = await prisma.product.findUnique({
            where: { slug: productData.slug },
            include: { images: true },
        });

        if (existingProduct) {
            // Update existing product and ensure it has an image
            if (existingProduct.images.length === 0 && productData.image) {
                await prisma.productImage.create({
                    data: {
                        productId: existingProduct.id,
                        url: productData.image,
                        alt: productData.title,
                        isPrimary: true,
                        sortOrder: 0,
                    },
                });
                console.log(`  Added image to existing product: ${productData.title}`);
            }
        } else {
            // Create new product with image
            const product = await prisma.product.create({
                data: {
                    title: productData.title,
                    titleEn: productData.titleEn,
                    slug: productData.slug,
                    description: productData.description,
                    descriptionEn: productData.descriptionEn,
                    price: productData.price,
                    dimensions: productData.dimensions,
                    materials: productData.materials,
                    condition: productData.condition,
                    provenance: productData.provenance,
                    categoryId: category?.id,
                    isFeatured: productData.isFeatured,
                    status: productData.status || 'AVAILABLE',
                },
            });

            // Create image for the product
            if (productData.image) {
                await prisma.productImage.create({
                    data: {
                        productId: product.id,
                        url: productData.image,
                        alt: productData.title,
                        isPrimary: true,
                        sortOrder: 0,
                    },
                });
            }
        }
    }

    console.log(`✓ Created/updated ${productsData.length} sample products with images`);

    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@antichitabarbaglia.it';

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { role: 'ADMIN' },
        create: {
            email: adminEmail,
            name: 'Admin',
            role: 'ADMIN',
        },
    });

    console.log(`✓ Admin user created/updated: ${adminEmail}`);

    console.log('✅ Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
