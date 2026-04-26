"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "../utils/supabase";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;

// ── Color Tokens (Pastel Premium Theme) ─────────────────────────────────────
const TOKENS = {
  cream: "#FFEABB",
  peach: "#FBC3C1",
  rose: "#FAACBF",
  pink: "#FE81D4",
  creamLight: "#FFF5E0",
  peachLight: "#FDEBEA",
  roseLight: "#FDE8EE",
  pinkLight: "#FFE4F5",
  textDark: "#2D1B2E",
  textMid: "#6B4E6B",
  textLight: "#9B7D9B",
  white: "#FFFFFF",
  glass: "rgba(255, 255, 255, 0.72)",
  glassDark: "rgba(45, 27, 46, 0.82)",
} as const;

// ── Toast Container ───────────────────────────────────────────────────────────
function ToastContainer({
  toasts,
  remove,
}: {
  toasts: Toast[];
  remove: (id: number) => void;
}) {
  const styles: Record<
    ToastType,
    { bg: string; icon: string; border: string }
  > = {
    success: {
      bg: "linear-gradient(135deg,#A8E6CF,#88D8A3)",
      icon: "check",
      border: "rgba(168,230,207,0.5)",
    },
    error: {
      bg: "linear-gradient(135deg,#FFB7B2,#FF9E99)",
      icon: "close",
      border: "rgba(255,183,178,0.5)",
    },
    info: {
      bg: "linear-gradient(135deg,#C7CEEA,#B5B9E8)",
      icon: "info",
      border: "rgba(199,206,234,0.5)",
    },
    warning: {
      bg: "linear-gradient(135deg,#FFDAC1,#FFC8A2)",
      icon: "alert",
      border: "rgba(255,218,193,0.5)",
    },
  };

  const iconSvg: Record<string, string> = {
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    alert: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const s = styles[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.88 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="pointer-events-auto relative flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl min-w-[280px] max-w-sm border overflow-hidden backdrop-blur-xl"
              style={{
                background: TOKENS.glass,
                borderColor: s.border,
                boxShadow: `0 8px 32px ${s.border}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: s.bg }}
                dangerouslySetInnerHTML={{ __html: iconSvg[s.icon] }}
              />
              <p
                className="text-sm font-bold leading-snug flex-1"
                style={{ color: TOKENS.textDark }}
              >
                {t.message}
              </p>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => remove(t.id)}
                className="flex-shrink-0 ml-1 transition-colors"
                style={{ color: TOKENS.textLight }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = TOKENS.textDark)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = TOKENS.textLight)
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
              <motion.div
                className="absolute bottom-0 left-0 h-[3px] rounded-full"
                style={{ background: s.bg }}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3.5, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ── Floating Particles Component ──────────────────────────────────────────────
function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 20 }).map((_, i) => {
        // We use the index 'i' to do pseudo-random math so the server and client always match!
        const colors = ["#FFEABB", "#FBC3C1", "#FAACBF", "#FE81D4"];
        const color = colors[i % 4];

        const size = 4 + ((i * 17) % 8);
        const left = `${(i * 5.3) % 100}%`;
        const top = `${(i * 7.7 + 10) % 100}%`;
        const duration = 8 + ((i * 13) % 12);
        const delay = (i * 3) % 5;

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              background: color,
              left,
              top,
              opacity: 0.15,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -30, 0, 20, 0],
              x: [0, 15, -10, 5, 0],
              scale: [1, 1.2, 0.8, 1.1, 1],
              opacity: [0.15, 0.25, 0.1, 0.2, 0.15],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isJewelleryOpen, setIsJewelleryOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [wishedIds, setWishedIds] = useState<Set<number>>(new Set());

  // 1. ADDED: User state for the Navbar
  const [user, setUser] = useState<any>(null);

  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [specials, setSpecials] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // 2. ADDED: Check login status
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // ── Toast helpers ────────────────────────────────────────────────────────
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3700,
    );
  }, []);

  // ── Data fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*");
      if (productData) {
        setNewArrivals(productData.filter((p) => p.is_new_arrival === true));
        setSpecials(productData.filter((p) => p.is_special === true));
        setBestSellers(productData.filter((p) => p.is_best_seller === true));
      }
      if (productError)
        console.error(
          "Product Error:",
          productError.message,
          productError.details,
        );

      const { data: testimonialData, error: testimonialError } = await supabase
        .from("testimonials")
        .select("*");
      if (testimonialData) setTestimonials(testimonialData);
      if (testimonialError)
        console.error(
          "Testimonial Error:",
          testimonialError.message,
          testimonialError.details,
        );

      setIsMounted(true);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleBuyNow = (
    productName: string,
    productPrice: number,
    imageUrl: string,
  ) => {
    const phoneNumber = "916290785398";
    const message = `Hey Bowbox! I want to know more about this item: ${productName}\nPrice: ₹${productPrice}\nImage Link: ${imageUrl}`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const toggleWishlist = async (productId: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      showToast("Please log in to save items to your wishlist", "warning");
      return;
    }
    const { error } = await supabase
      .from("wishlist")
      .insert([{ user_id: user.id, product_id: productId }]);
    if (error) {
      if (error.code === "23505")
        showToast("Already in your wishlist!", "info");
      else showToast("Error saving to wishlist: " + error.message, "error");
    } else {
      setWishedIds((prev) => new Set([...prev, productId]));
      setTimeout(
        () =>
          setWishedIds((prev) => {
            const n = new Set(prev);
            n.delete(productId);
            return n;
          }),
        2000,
      );
      showToast("Saved to wishlist!", "success");
    }
  };

  const addToCart = async (productId: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      showToast("Please log in to add items to your cart", "warning");
      return;
    }
    const { error } = await supabase
      .from("cart")
      .insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);
    if (error) {
      showToast("Error adding to cart: " + error.message, "error");
    } else {
      setAddedIds((prev) => new Set([...prev, productId]));
      setTimeout(
        () =>
          setAddedIds((prev) => {
            const n = new Set(prev);
            n.delete(productId);
            return n;
          }),
        2000,
      );
      showToast("Added to cart!", "success");
    }
  };

  // ── Variants ───────────────────────────────────────────────────────────────
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const cardHover: Variants = {
    rest: { y: 0, scale: 1 },
    hover: {
      y: -10,
      scale: 1.02,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  // ── Product card renderer ──────────────────────────────────────────────────
  const renderProductCards = (products: any[], keyPrefix = "") => {
    if (products.length === 0) {
      return (
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: TOKENS.peachLight }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={TOKENS.peach}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <p
              className="text-sm font-bold"
              style={{ color: TOKENS.textLight }}
            >
              No items uploaded yet...
            </p>
          </div>
        </div>
      );
    }

    return products.map((product, idx) => {
      // NEW: Compute Main Image and Hover Image
      const gallery =
        product.image_gallery && product.image_gallery.length > 0
          ? product.image_gallery
          : [product.image_url];

      const mainImage = gallery[0];
      const hoverImage = gallery.length > 1 ? gallery[1] : gallery[0];

      return (
        <motion.div
          key={`${keyPrefix}${product.id}`}
          className="w-56 shrink-0 flex flex-col rounded-3xl overflow-hidden group relative"
          style={{
            background: isDarkMode ? "rgba(45,27,46,0.6)" : TOKENS.white,
            boxShadow: isDarkMode
              ? "0 4px 24px rgba(254,129,212,0.08)"
              : "0 4px 24px rgba(251,195,193,0.15)",
            border: `1px solid ${isDarkMode ? "rgba(254,129,212,0.1)" : "rgba(251,195,193,0.2)"}`,
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.08 }}
          variants={cardHover}
          whileHover="hover"
        >
          <Link href={`/product/${product.id}`}>
            <div className="relative overflow-hidden aspect-square bg-white">
              {/* Base Image */}
              <motion.img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover absolute inset-0 transition-opacity duration-500 group-hover:opacity-0"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              {/* Secondary Hover Image */}
              <motion.img
                src={hoverImage}
                alt={`${product.name} alternate view`}
                className="w-full h-full object-cover absolute inset-0 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-108 transform"
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-4 z-10"
                style={{
                  background:
                    "linear-gradient(to top, rgba(254,129,212,0.25), transparent)",
                }}
              >
                <motion.span
                  initial={{ y: 10, opacity: 0 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  className="px-4 py-2 rounded-full text-xs font-black shadow-lg backdrop-blur-md"
                  style={{
                    background: TOKENS.glass,
                    color: TOKENS.pink,
                    border: `1px solid ${TOKENS.pink}30`,
                  }}
                >
                  View Details
                </motion.span>
              </div>
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl z-20"
                style={{
                  background: `linear-gradient(180deg, ${TOKENS.peach}, ${TOKENS.pink})`,
                }}
              />
            </div>
          </Link>

          <div className="p-4 flex flex-col flex-1 relative z-20 bg-white dark:bg-transparent">
            <Link href={`/product/${product.id}`}>
              <h3
                className="font-bold text-xs leading-snug line-clamp-2 min-h-[36px] mb-2 transition-colors duration-300"
                style={{ color: isDarkMode ? TOKENS.cream : TOKENS.textDark }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = TOKENS.pink)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = isDarkMode
                    ? TOKENS.cream
                    : TOKENS.textDark)
                }
              >
                {product.name}
              </h3>
            </Link>
            <p
              className="font-black text-sm mb-3 mt-auto tracking-wide"
              style={{ color: TOKENS.pink }}
            >
              ₹{product.price.toLocaleString("en-IN")}
            </p>

            <div className="flex gap-2 mb-2">
              <motion.button
                onClick={() => addToCart(product.id)}
                whileTap={{ scale: 0.92 }}
                className="flex-1 py-2.5 rounded-xl font-bold text-[10px] transition-all relative overflow-hidden flex items-center justify-center gap-1"
                style={{
                  background: addedIds.has(product.id)
                    ? "linear-gradient(135deg,#A8E6CF,#88D8A3)"
                    : TOKENS.creamLight,
                  color: addedIds.has(product.id)
                    ? TOKENS.white
                    : TOKENS.textDark,
                  border: `1.5px solid ${addedIds.has(product.id) ? "transparent" : `${TOKENS.peach}40`}`,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={addedIds.has(product.id) ? "y" : "n"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1"
                  >
                    {addedIds.has(product.id) ? "✓ Added" : "+ Add to Cart"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              <motion.button
                onClick={() => toggleWishlist(product.id)}
                whileTap={{ scale: 0.88 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  background: wishedIds.has(product.id)
                    ? TOKENS.rose
                    : TOKENS.roseLight,
                  border: `1.5px solid ${wishedIds.has(product.id) ? TOKENS.rose : `${TOKENS.rose}30`}`,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wishedIds.has(product.id) ? "f" : "e"}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.5 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      stiffness: 400,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={wishedIds.has(product.id) ? TOKENS.white : "none"}
                      stroke={
                        wishedIds.has(product.id) ? TOKENS.white : TOKENS.rose
                      }
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>

            <motion.button
              onClick={() =>
                handleBuyNow(product.name, product.price, mainImage)
              }
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-2.5 rounded-xl font-bold text-[10px] text-white relative overflow-hidden shadow-lg flex items-center justify-center gap-1.5"
              style={{
                background: `linear-gradient(135deg, ${TOKENS.peach}, ${TOKENS.pink})`,
              }}
            >
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.2) 50%, transparent 62%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
              Buy Now
            </motion.button>
          </div>
        </motion.div>
      );
    });
  };
  // ── Static data ────────────────────────────────────────────────────────────
  const sections = [
    {
      title: "New Arrivals",
      data: newArrivals,
      accent: TOKENS.peach,
      bg: TOKENS.peachLight,
    },
    {
      title: "Specials",
      data: specials,
      accent: TOKENS.rose,
      bg: TOKENS.roseLight,
    },
    {
      title: "Best Sellers",
      data: bestSellers,
      accent: TOKENS.pink,
      bg: TOKENS.pinkLight,
    },
  ];

  // ── SVG Icons ──────────────────────────────────────────────────────────────
  const icons = {
    sun: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    moon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
    user: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    heart: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    cart: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
    arrowRight: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    chevronDown: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ),
    gift: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
      </svg>
    ),
    star: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={TOKENS.peach}
        stroke={TOKENS.peach}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    sparkle: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={TOKENS.pink}
        stroke={TOKENS.pink}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
      </svg>
    ),
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen transition-colors duration-500 overflow-x-hidden relative"
      style={{
        background: isDarkMode
          ? "linear-gradient(145deg, #1a0f1a 0%, #2d1b2e 60%, #1f1420 100%)"
          : "linear-gradient(145deg, #FFF9F0 0%, #FFF5F5 50%, #FFF0F8 100%)",
      }}
    >
      {/* Ambient background effects */}
      <FloatingParticles />

      {/* Large ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute rounded-full blur-[100px]"
          style={{
            background: TOKENS.peach,
            width: 500,
            height: 500,
            right: "-10%",
            top: "-5%",
            opacity: isDarkMode ? 0.04 : 0.08,
          }}
          animate={{ scale: [1, 1.15, 1], x: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[100px]"
          style={{
            background: TOKENS.pink,
            width: 400,
            height: 400,
            left: "-5%",
            top: "40%",
            opacity: isDarkMode ? 0.03 : 0.06,
          }}
          animate={{ scale: [1, 1.2, 1], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full blur-[100px]"
          style={{
            background: TOKENS.cream,
            width: 350,
            height: 350,
            right: "20%",
            bottom: "10%",
            opacity: isDarkMode ? 0.03 : 0.07,
          }}
          animate={{ scale: [1, 1.1, 1], x: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Toast portal */}
      <ToastContainer toasts={toasts} remove={removeToast} />

      {/* ── TOP BAR ── */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-50 flex justify-between items-center px-6 py-3 backdrop-blur-xl border-b"
        style={{
          background: isDarkMode
            ? "rgba(45,27,46,0.7)"
            : "rgba(255,255,255,0.7)",
          borderColor: isDarkMode
            ? "rgba(254,129,212,0.1)"
            : "rgba(251,195,193,0.2)",
        }}
      >
        <motion.button
          onClick={() => setIsDarkMode(!isDarkMode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border"
          style={{
            background: isDarkMode
              ? "rgba(254,129,212,0.15)"
              : "rgba(255,234,187,0.3)",
            color: isDarkMode ? TOKENS.cream : TOKENS.textDark,
            borderColor: isDarkMode
              ? "rgba(254,129,212,0.2)"
              : "rgba(255,234,187,0.5)",
          }}
        >
          {isDarkMode ? icons.sun : icons.moon}
          <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </motion.button>

        <div className="flex items-center gap-2">
          {[
            // 3. ADDED: Dynamic Login / Profile switch!
            {
              label: user ? "My Profile" : "Login",
              href: user ? "/profile" : "/auth",
              icon: icons.user,
            },
            { label: "Wishlist", href: "/wishlist", icon: icons.heart },
            { label: "Cart", href: "/cart", icon: icons.cart },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <motion.button
                whileHover={{ scale: 1.06, y: -1 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border"
                style={{
                  background: isDarkMode
                    ? "rgba(254,129,212,0.15)"
                    : "rgba(255,234,187,0.3)",
                  color: isDarkMode ? TOKENS.cream : TOKENS.textDark,
                  borderColor: isDarkMode
                    ? "rgba(254,129,212,0.2)"
                    : "rgba(255,234,187,0.5)",
                }}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </motion.button>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── HERO ── */}
      <motion.div
        className="relative z-10 flex flex-col md:flex-row justify-center items-center gap-6 sm:gap-8 md:gap-10 w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-6 min-h-[320px] sm:min-h-[350px] md:min-h-[450px] lg:min-h-[600px] border-b md:aspect-video"
        style={{
          background: isDarkMode
            ? "linear-gradient(145deg, rgba(45,27,46,0.5) 0%, rgba(26,15,26,0.3) 100%)"
            : "linear-gradient(145deg, rgba(255,250,240,0.8) 0%, rgba(255,245,246,0.6) 60%, rgba(255,240,248,0.8) 100%)",
          borderColor: isDarkMode
            ? "rgba(254,129,212,0.1)"
            : "rgba(251,195,193,0.25)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* ── AUTO-SCROLLING BANNERS (Background) ── */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div
            className="flex h-full"
            animate={{
              x: [
                0,
                0,
                "-100%",
                "-100%",
                "-200%",
                "-200%",
                "-300%",
                "-300%",
                "-400%",
                "-400%",
                "-500%",
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1],
            }}
          >
            {[
              "/ban1.PNG",
              "/ban2.jpg",
              "/ban3.jpg",
              "/ban4.jpg",
              "/ban5.png",
            ].map((banner, i) => (
              <div
                key={i}
                className="w-full h-full flex-shrink-0 flex items-center justify-center relative"
              >
                <img
                  src={banner}
                  alt={`Banner ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for content readability */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.25))",
                  }}
                />
              </div>
            ))}
          </motion.div>

          {/* Cloned banners for seamless loop */}
          <motion.div
            className="flex h-full absolute top-0 left-0 w-full"
            animate={{
              x: [
                0,
                0,
                "-100%",
                "-100%",
                "-200%",
                "-200%",
                "-300%",
                "-300%",
                "-400%",
                "-400%",
                "-500%",
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.15, 0.2, 0.35, 0.4, 0.55, 0.6, 0.75, 0.8, 0.95, 1],
            }}
            style={{ pointerEvents: "none" }}
          >
            {[
              "/ban1.jpg",
              "/ban2.jpeg",
              "/ban3.jpeg",
              "/ban4.jpeg",
              "/ban5.jpeg",
            ].map((banner, i) => (
              <div
                key={`clone-${i}`}
                className="w-full h-full flex-shrink-0 flex items-center justify-center relative"
              >
                <img
                  src={banner}
                  alt={`Banner ${i + 1} Clone`}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.25))",
                  }}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Content on top (z-20) ── */}
        <div className="relative z-20 pointer-events-none flex flex-col md:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-10 w-full">
          {/* Decorative floating elements */}
          {isMounted && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 8 + i * 4,
                    height: 8 + i * 4,
                    background: i % 2 === 0 ? TOKENS.peach : TOKENS.rose,
                    left: `${8 + i * 14}%`,
                    top: `${12 + (i % 3) * 22}%`,
                    opacity: 0.2,
                    filter: "blur(2px)",
                  }}
                  animate={{
                    y: [0, -25, 0],
                    x: [0, i % 2 === 0 ? 15 : -15, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.35, 0.2],
                  }}
                  transition={{
                    duration: 4 + i * 0.6,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute"
                  style={{
                    left: `${(i * 12.5) % 100}%`,
                    top: `${(i * 11.3 + 5) % 100}%`,
                  }}
                  animate={{
                    scale: [1, 0, 1],
                    opacity: [0.3, 0, 0.3],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill={TOKENS.pink}
                    opacity="0.4"
                  >
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                </motion.div>
              ))}
            </div>
          )}

          {/* Decorative curved lines */}
          <svg
            className="absolute inset-0 z-20 w-full h-full pointer-events-none opacity-[0.03]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,300 Q400,100 800,300 T1600,300"
              fill="none"
              stroke={TOKENS.pink}
              strokeWidth="2"
            />
            <path
              d="M0,400 Q400,200 800,400 T1600,400"
              fill="none"
              stroke={TOKENS.peach}
              strokeWidth="2"
            />
          </svg>

          <motion.div
            initial={{ x: -80, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            whileHover={{ scale: 1.03, rotate: 2 }}
            className="relative z-20"
          >
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-60 md:h-60 rounded-full flex items-center justify-center shadow-2xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${TOKENS.cream}, ${TOKENS.peach})`,
                boxShadow: `0 20px 60px ${TOKENS.peach}40`,
              }}
            >
              <img
                src="/logo-circle.jpg"
                alt="Bowbox Logo"
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-52 md:h-52 object-contain rounded-full"
              />
            </div>
            <motion.div
              className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: TOKENS.pink }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {icons.sparkle}
            </motion.div>
          </motion.div>

          <div className="relative z-20 text-center md:text-left max-w-sm sm:max-w-md pointer-events-auto flex-shrink-0">
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
              className="mb-2"
            >
              <img
                src="/logo-text.png"
                alt="Bowbox Text Logo"
                className="w-56 md:w-72 h-auto object-contain drop-shadow-lg mx-auto md:mx-0"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 justify-center md:justify-start mb-4"
            >
              <div className="h-px w-8" style={{ background: TOKENS.peach }} />
              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: TOKENS.pink }}
              >
                Handcrafted with love
              </p>
              <div className="h-px w-8" style={{ background: TOKENS.peach }} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-sm mb-6 leading-relaxed"
              style={{ color: TOKENS.textMid }}
            >
              Curated gifts for every moment. From birthdays to anniversaries,
              find the perfect expression of your feelings.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/shop">
                <motion.button
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 rounded-full font-bold text-sm shadow-2xl relative overflow-hidden flex items-center gap-2 mx-auto md:mx-0"
                  style={{
                    background: `linear-gradient(135deg, ${TOKENS.peach}, ${TOKENS.pink})`,
                    color: TOKENS.white,
                    boxShadow: `0 12px 40px ${TOKENS.pink}40`,
                  }}
                >
                  <motion.span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="relative z-10">Shop Collection</span>
                  <span className="relative z-10">{icons.arrowRight}</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── NAV ── */}
      <motion.nav
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-40 flex justify-center gap-3 px-6 py-4 backdrop-blur-xl border-b"
        style={{
          background: isDarkMode
            ? "rgba(45,27,46,0.6)"
            : "rgba(255,255,255,0.6)",
          borderColor: isDarkMode
            ? "rgba(254,129,212,0.08)"
            : "rgba(251,195,193,0.15)",
        }}
      >
        {[
          { label: "Home", href: "/" },
          { label: "Shop All", href: "/shop" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="font-bold text-sm px-7 py-2.5 rounded-full text-white shadow-lg relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${TOKENS.peach}, ${TOKENS.pink})`,
              }}
            >
              {item.label}
            </motion.button>
          </Link>
        ))}

        <div className="relative">
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className="font-bold text-sm px-7 py-2.5 rounded-full border-2 flex items-center gap-2 transition-all"
            style={{
              color: TOKENS.pink,
              borderColor: `${TOKENS.pink}30`,
              background: isDarkMode
                ? "rgba(254,129,212,0.1)"
                : TOKENS.pinkLight,
            }}
          >
            Categories
            <motion.span
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {icons.chevronDown}
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                onMouseLeave={() => setOpenSubmenu(null)}
                className="absolute top-full mt-3 left-1/2 -translate-x-1/2 shadow-2xl rounded-2xl overflow-visible border z-50 backdrop-blur-xl"
                style={{
                  background: isDarkMode ? TOKENS.glassDark : TOKENS.glass,
                  borderColor: isDarkMode
                    ? "rgba(254,129,212,0.15)"
                    : "rgba(251,195,193,0.25)",
                  boxShadow: `0 12px 40px ${TOKENS.peach}20`,
                }}
              >
                {[
                  {
                    label: "Jewellery",
                    href: "/shop?category=Jewellery",
                    icon: "ring",
                    submenu: [
                      {
                        label: "Pendant",
                        href: "/shop?category=Jewellery&sub=Pendant",
                      },
                      {
                        label: "Earring",
                        href: "/shop?category=Jewellery&sub=Earring",
                      },
                      {
                        label: "Ring",
                        href: "/shop?category=Jewellery&sub=Ring",
                      },
                      {
                        label: "Bracelet",
                        href: "/shop?category=Jewellery&sub=Bracelet",
                      },
                      {
                        label: "Other Jewelleries",
                        href: "/shop?category=Jewellery&sub=Other%20Jewelleries",
                      },
                    ],
                  },
                  {
                    label: "Boxes",
                    href: "/shop?category=Boxes",
                    icon: "gift",
                  },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="w-full relative overflow-visible"
                  >
                    {item.submenu ? (
                      <>
                        {/* Jewellery Parent Button */}
                        <div className="overflow-hidden">
                          <motion.button
                            onClick={() => {
                              setIsJewelleryOpen(!isJewelleryOpen);
                            }}
                            onMouseEnter={(e) => {
                              setOpenSubmenu(item.label);
                              e.currentTarget.style.background = `linear-gradient(90deg, ${TOKENS.peach}, ${TOKENS.pink})`;
                              e.currentTarget.style.color = TOKENS.white;
                            }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="w-full px-4 py-3.5 text-left text-sm font-bold transition-all border-b flex items-center justify-between md:hover:bg-gradient-to-r"
                            style={{
                              color: TOKENS.pink,
                              borderColor: isDarkMode
                                ? "rgba(254,129,212,0.08)"
                                : "rgba(251,195,193,0.15)",
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = TOKENS.pink;
                            }}
                          >
                            <span style={{ opacity: 0.7 }}>{item.label}</span>
                            <motion.svg
                              animate={{ rotate: isJewelleryOpen ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="md:hidden"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </motion.svg>
                            {/* Desktop arrow always visible, pointing right */}
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="hidden md:block"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </motion.button>
                        </div>

                        {/* Mobile Accordion - Vertical Layout */}
                        <AnimatePresence>
                          {isJewelleryOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="md:hidden overflow-hidden"
                            >
                              <div className="overflow-hidden">
                                {item.submenu.map((subitem, subIdx) => (
                                  <Link
                                    key={subitem.href}
                                    href={subitem.href}
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setIsJewelleryOpen(false);
                                    }}
                                  >
                                    <motion.button
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: subIdx * 0.03 }}
                                      className="w-full px-4 py-3 text-left text-sm font-bold transition-all border-b last:border-0 flex items-center gap-3 pl-8"
                                      style={{
                                        color: TOKENS.pink,
                                        borderColor: isDarkMode
                                          ? "rgba(254,129,212,0.08)"
                                          : "rgba(251,195,193,0.15)",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = `linear-gradient(90deg, ${TOKENS.peach}, ${TOKENS.pink})`;
                                        e.currentTarget.style.color =
                                          TOKENS.white;
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                          "transparent";
                                        e.currentTarget.style.color =
                                          TOKENS.pink;
                                      }}
                                    >
                                      <span className="text-xs opacity-60">
                                        →
                                      </span>
                                      <span style={{ opacity: 0.8 }}>
                                        {subitem.label}
                                      </span>
                                    </motion.button>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Desktop Popup - Horizontal Layout */}
                        <AnimatePresence>
                          {openSubmenu === item.label && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.2 }}
                              onMouseEnter={() => setOpenSubmenu(item.label)}
                              onMouseLeave={() => setOpenSubmenu(null)}
                              className="hidden md:block absolute left-full top-0 ml-2 min-w-48 rounded-xl overflow-visible border shadow-lg z-50 backdrop-blur-xl"
                              style={{
                                background: isDarkMode
                                  ? TOKENS.glassDark
                                  : TOKENS.glass,
                                borderColor: isDarkMode
                                  ? "rgba(254,129,212,0.15)"
                                  : "rgba(251,195,193,0.25)",
                                boxShadow: `0 12px 40px ${TOKENS.peach}20`,
                              }}
                            >
                              <div className="overflow-hidden rounded-xl">
                                {item.submenu.map((subitem, subIdx) => (
                                  <Link
                                    key={subitem.href}
                                    href={subitem.href}
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      setOpenSubmenu(null);
                                    }}
                                  >
                                    <motion.button
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: subIdx * 0.03 }}
                                      className="w-full px-4 py-3 text-left text-sm font-bold transition-all border-b last:border-0 flex items-center gap-3 pl-6"
                                      style={{
                                        color: TOKENS.pink,
                                        borderColor: isDarkMode
                                          ? "rgba(254,129,212,0.08)"
                                          : "rgba(251,195,193,0.15)",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = `linear-gradient(90deg, ${TOKENS.peach}, ${TOKENS.pink})`;
                                        e.currentTarget.style.color =
                                          TOKENS.white;
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                          "transparent";
                                        e.currentTarget.style.color =
                                          TOKENS.pink;
                                      }}
                                    >
                                      <span className="text-xs opacity-60">
                                        →
                                      </span>
                                      <span style={{ opacity: 0.8 }}>
                                        {subitem.label}
                                      </span>
                                    </motion.button>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="overflow-hidden">
                          <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="w-full px-4 py-3.5 text-left text-sm font-bold transition-all border-b last:border-0 flex items-center gap-3"
                            style={{
                              color: TOKENS.pink,
                              borderColor: isDarkMode
                                ? "rgba(254,129,212,0.08)"
                                : "rgba(251,195,193,0.15)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `linear-gradient(90deg, ${TOKENS.peach}, ${TOKENS.pink})`;
                              e.currentTarget.style.color = TOKENS.white;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = TOKENS.pink;
                            }}
                          >
                            <span style={{ opacity: 0.7 }}>{item.label}</span>
                          </motion.button>
                        </div>
                      </Link>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ── PRODUCT SECTIONS ── */}
      <div className="relative z-10 py-6 space-y-12 px-4 md:px-8">
        {sections.map(({ title, data, accent, bg }) => (
          <motion.section
            key={title}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-1.5 h-8 rounded-full"
                style={{ background: accent }}
              />
              <h2
                className="text-2xl md:text-3xl font-black tracking-tight"
                style={{
                  color: isDarkMode ? TOKENS.cream : TOKENS.textDark,
                  fontFamily: "Georgia, serif",
                }}
              >
                {title}
              </h2>
              <div
                className="flex-1 h-px ml-3"
                style={{ background: `${accent}25` }}
              />
              <Link href="/shop">
                <motion.span
                  whileHover={{ x: 4 }}
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  style={{ color: accent }}
                >
                  See all
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={accent}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </motion.span>
              </Link>
            </div>

            <div
              className="rounded-3xl p-6 border overflow-x-auto overflow-y-hidden scrollbar-hide"
              style={{
                background: isDarkMode ? "rgba(45,27,46,0.4)" : bg,
                borderColor: isDarkMode
                  ? "rgba(254,129,212,0.1)"
                  : "rgba(255,255,255,0.8)",
                boxShadow: isDarkMode
                  ? "0 4px 24px rgba(254,129,212,0.05)"
                  : "0 4px 24px rgba(251,195,193,0.1)",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <div className="flex gap-5 px-2">{renderProductCards(data)}</div>
            </div>
          </motion.section>
        ))}
        {/* Testimonials */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-1.5 h-8 rounded-full"
              style={{ background: TOKENS.cream }}
            />
            <h2
              className="text-2xl md:text-3xl font-black tracking-tight"
              style={{
                color: isDarkMode ? TOKENS.cream : TOKENS.textDark,
                fontFamily: "Georgia, serif",
              }}
            >
              What Customers Say
            </h2>
            <div
              className="flex-1 h-px ml-3"
              style={{ background: `${TOKENS.cream}40` }}
            />
          </div>

          <div
            className="rounded-3xl p-6 border overflow-x-auto overflow-y-hidden scrollbar-hide"
            style={{
              background: isDarkMode ? "rgba(45,27,46,0.4)" : TOKENS.creamLight,
              borderColor: isDarkMode
                ? "rgba(254,129,212,0.1)"
                : "rgba(255,255,255,0.8)",
              boxShadow: isDarkMode
                ? "0 4px 24px rgba(254,129,212,0.05)"
                : "0 4px 24px rgba(255,234,187,0.15)",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="flex gap-5 px-2">
              {testimonials.length === 0 ? (
                <div className="w-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{
                        background: isDarkMode
                          ? "rgba(254,129,212,0.1)"
                          : TOKENS.peachLight,
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={TOKENS.peach}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                      </svg>
                    </div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: TOKENS.textLight }}
                    >
                      No reviews yet...
                    </p>
                  </div>
                </div>
              ) : (
                testimonials.map((t) => (
                  <motion.div
                    key={t.id}
                    className="h-64 w-auto rounded-2xl shadow-lg border-2 flex-shrink-0 overflow-hidden relative group"
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(254,129,212,0.15)"
                        : TOKENS.white,
                      boxShadow: isDarkMode
                        ? "0 8px 32px rgba(0,0,0,0.3)"
                        : "0 8px 32px rgba(251,195,193,0.2)",
                    }}
                    whileHover={{ scale: 1.03, y: -6 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={t.image_url}
                      alt="Review"
                      className="h-full w-auto object-cover"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(254,129,212,0.3), transparent)",
                      }}
                    />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.section>
      </div>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 mt-16 py-10 text-center border-t"
        style={{
          background: `linear-gradient(135deg, ${TOKENS.peach}, ${TOKENS.pink})`,
          borderColor: `${TOKENS.peach}30`,
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          {icons.gift}
          <p className="text-white/90 text-xs font-bold uppercase tracking-[0.2em]">
            Handcrafted with care
          </p>
        </div>
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
          &copy; 2026 BOWBOX — All rights reserved
        </p>
      </motion.footer>

      {/* Floating gift button */}
      <motion.div
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center z-50 cursor-pointer backdrop-blur-md border"
        style={{
          background: `linear-gradient(135deg, ${TOKENS.peach}, ${TOKENS.pink})`,
          borderColor: "rgba(255,255,255,0.3)",
          boxShadow: `0 12px 40px ${TOKENS.pink}50`,
        }}
        animate={{
          y: [0, -12, 0],
          rotate: [0, 5, -5, 0],
          boxShadow: [
            `0 12px 40px ${TOKENS.pink}50`,
            `0 20px 50px ${TOKENS.pink}70`,
            `0 12px 40px ${TOKENS.pink}50`,
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.15, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
      >
        {icons.gift}
      </motion.div>
    </main>
  );
}
