import FeatureDetail from "@/components/FeatureDetail";

export default function Page() {
  return (
    <FeatureDetail
      spec={{
        title: "Mobile App",
        desc: "Track inventory from any device with a responsive dashboard and camera scanning.",
        image: "/mock-generic.svg",
        bullets: [
          "Responsive UI works on phones and tablets",
          "Scan barcodes and QR codes with the camera",
          "Update quantities instantly across variants",
        ],
      }}
    />
  );
}
