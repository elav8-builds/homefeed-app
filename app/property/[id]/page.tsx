import type { Metadata } from "next";
import { properties } from "../../data/properties";
import { agents } from "../../data/agents";
import PropertyPageClient from "./PropertyPageClient";

// Generate static params for all properties (enables static generation)
export function generateStaticParams() {
  return properties.map(p => ({ id: p.id }));
}

// Dynamic metadata for SEO + Open Graph per listing
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;

  // Try to find property from seed data first (for demo mode)
  const property = properties.find(p => p.id === id);
  const agent = property ? agents.find(a => a.id === property.agentId) : null;

  if (!property) {
    return {
      title: "Property Not Found | HomeFeed",
      description: "This listing is no longer available.",
    };
  }

  const title = `${property.address} | $${property.price.toLocaleString()} | HomeFeed`;
  const description = `${property.beds} bed, ${property.baths} bath, ${property.sqft.toLocaleString()} sqft ${property.propertyType.replace(/_/g, " ")} in ${property.city}, ${property.state}. ${property.description.slice(0, 150)}`;

  return {
    title,
    description,
    openGraph: {
      title: `$${property.price.toLocaleString()} — ${property.beds}bd ${property.baths}ba in ${property.city}`,
      description,
      images: property.images.slice(0, 4).map(url => ({
        url,
        width: 1200,
        height: 630,
        alt: `${property.address}, ${property.city}`,
      })),
      type: "website",
      siteName: "HomeFeed",
    },
    twitter: {
      card: "summary_large_image",
      title: `$${property.price.toLocaleString()} — ${property.beds}bd ${property.baths}ba in ${property.city}`,
      description,
      images: property.images[0] ? [property.images[0]] : [],
    },
    other: {
      "og:price:amount": property.price.toString(),
      "og:price:currency": "USD",
      ...(agent ? { "article:author": agent.name } : {}),
    },
  };
}

export default async function PropertyPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return <PropertyPageClient propertyId={id} />;
}
