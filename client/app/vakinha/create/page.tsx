"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useForm } from "react-hook-form";
import { useCreateVakinha } from "@/app/hooks/hooks";
import { useState } from "react";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  description: z.string().min(5, "Descreva melhor sua vakinha."),
  goal: z.string().min(1, "Informe uma meta de doação."),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, "A imagem deve ter no máximo 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Apenas imagens JPG, PNG ou WEBP são permitidas",
    ),
});

export default function CreateVakinhaPage() {
  const { createVakinha, isLoading, isUploading, isCreating, blobId } =
    useCreateVakinha();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      goal: "",
      image: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("📝 Valores do formulário:", values);

    if (!values.image) {
      return;
    }

    const goalAmount = parseFloat(values.goal);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      return;
    }

    await createVakinha(
      values.name,
      values.description,
      goalAmount,
      values.image,
      (vakinhaId) => {
        console.log("🎉 Vakinha criada! ID:", vakinhaId);

        setSuccessMessage("✅ Vakinha criada com sucesso! Redirecionando...");
        setErrorMessage("");

        form.reset();
        setImagePreview("");

        // Sinalizar para outras páginas atualizarem a lista
        localStorage.setItem("vakinhaListNeedsRefresh", "true");

        // Redirecionar para a página da vakinha criada após 2 segundos
        setTimeout(() => {
          router.push(`/vakinha/campaign/${vakinhaId}`);
        }, 2000);
      },
      (error) => {
        console.error("❌ Erro:", error);
        setErrorMessage(error.message || "Erro ao criar vakinha");
        setSuccessMessage("");
      },
    );
  };

  const handleImageChange = (file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background-10)] text-white">
      <Navbar />
      <div className="flex flex-1 items-center justify-center py-4">
        <div className="bg-[var(--background-20)] p-6 rounded-2xl w-full max-w-md shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Vakinha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite o nome da vakinha"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Esse nome aparecerá na listagem.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite a descrição da vakinha"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Descreva o propósito da vakinha.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meta */}
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta de Doação (SUI)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 10"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Valor em SUI que você deseja arrecadar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload */}
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Upload da Foto</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="text-white"
                        disabled={isLoading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onChange(file);
                          handleImageChange(file);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Máximo 5MB. Formatos: JPG, PNG, WEBP
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview da imagem */}
              {imagePreview && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Preview:</p>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    height={100}
                    width={100}
                    className="w-full  rounded-lg border border-gray-600"
                  />
                </div>
              )}

              {/* Mostrar Blob ID quando upload for feito */}
              {blobId && (
                <div className="p-3 bg-green-900/30 border border-green-600 rounded-lg">
                  <p className="text-sm text-green-400">
                    ✅ Imagem enviada para Walrus!
                  </p>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    Blob ID: {blobId}
                  </p>
                </div>
              )}

              {/* Status de loading */}
              {isUploading && (
                <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                  <p className="text-sm text-blue-400">
                    📤 Enviando imagem para Walrus...
                  </p>
                </div>
              )}

              {isCreating && (
                <div className="p-3 bg-purple-900/30 border border-purple-600 rounded-lg">
                  <p className="text-sm text-purple-400">
                    🚀 Criando vakinha na blockchain...
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[var(--color-green-text)]/80 hover:bg-[var(--color-green-text)]/40 transition-colors duration-200"
                disabled={isLoading}
              >
                {isUploading
                  ? "Enviando imagem..."
                  : isCreating
                    ? "Criando vakinha..."
                    : "✨ Criar Vakinha"}
              </Button>

              {/* Mensagens de status */}
              {successMessage && (
                <div className="text-green-400 text-center text-sm font-semibold">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="text-red-400 text-center text-sm font-semibold">
                  {errorMessage}
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
