"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  bgColor: string; // Tailwind color class for playful card background
  age: string;
}

interface RecommendedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  bgColor: string;
  discount: string | null;
  colors: string[];
  age: string;
}

export default function CartPage() {
  // 1. Cart Items State (Initial items matching description)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "robo-1",
      name: "RoboBuddy Mini",
      category: "Interactive Spherical Robot",
      price: 270.0,
      originalPrice: 270.0,
      quantity: 1,
      image: "/images/robobuddy_toy.png",
      bgColor: "bg-accent-orange/40",
      age: "Ages 1-3",
    },
    {
      id: "robo-2",
      name: "BlockBot Builder",
      category: "Modular Magnetic Robot",
      price: 240.0,
      originalPrice: 240.0,
      quantity: 1,
      image: "/images/blockbot_toy.png",
      bgColor: "bg-accent-peach/40",
      age: "Ages 3-5",
    },
  ]);

  // 2. Recommended Products Data
  const recommendedProducts: RecommendedProduct[] = [
    {
      id: "rec-1",
      name: "Coding Crawler",
      category: "STEM Caterpillar Bot",
      price: 170.0,
      originalPrice: 200.0,
      image: "/images/crawler_toy.png",
      bgColor: "bg-accent-soft-blue/40",
      discount: "-15%",
      colors: ["#A3B1FF", "#C9E9F6", "#A9E8AE"],
      age: "Ages 6+",
    },
    {
      id: "rec-2",
      name: "Soundy Bot",
      category: "Musical Drum Robot",
      price: 85.0,
      originalPrice: 100.0,
      image: "/images/soundy_toy.png",
      bgColor: "bg-accent-yellow/40",
      discount: "-15%",
      colors: ["#FFF37E", "#FFC0DD", "#FFD9A0"],
      age: "Ages 1-2",
    },
    {
      id: "rec-3",
      name: "Smarty Block Set",
      category: "Interactive Alphabet Blocks",
      price: 45.0,
      originalPrice: 50.0,
      image: "/images/blockbot_toy.png",
      bgColor: "bg-accent-pink/40",
      discount: "-10%",
      colors: ["#FFC0DD", "#A3B1FF", "#A9E8AE"],
      age: "Ages 2-4",
    },
    {
      id: "rec-4",
      name: "Artie Drawing Droid",
      category: "Creative Drawing Robot",
      price: 110.0,
      originalPrice: 125.0,
      image: "/images/robobuddy_toy.png",
      bgColor: "bg-accent-purple/40",
      discount: "-12%",
      colors: ["#A3B1FF", "#FFAFA3", "#FFF37E"],
      age: "Ages 5+",
    },
  ];

  // 3. Page Interactivity States
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // decimal e.g. 0.15
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({
    "rec-1": 0,
    "rec-2": 0,
    "rec-3": 0,
    "rec-4": 0,
  });

  const recommendationSliderRef = useRef<HTMLDivElement>(null);

  // 4. Cart Logic Handlers
  const handleQuantityChange = (id: string, delta: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (couponCode.trim().toUpperCase() === "ROBO15") {
      setAppliedDiscount(0.15);
      setCouponSuccess("Yay! 15% discount applied successfully!");
    } else if (couponCode.trim() === "") {
      setCouponError("Please enter a coupon code.");
    } else {
      setCouponError("Invalid coupon. Try using code 'ROBO15'!");
    }
  };

  const handleAddToWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddRecommendedToCart = (prod: RecommendedProduct) => {
    // Check if product already exists in cart
    const existingItem = cartItems.find((item) => item.name === prod.name);
    if (existingItem) {
      handleQuantityChange(existingItem.id, 1);
    } else {
      const newItem: CartItem = {
        id: `robo-${Date.now()}`,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        originalPrice: prod.originalPrice,
        quantity: 1,
        image: prod.image,
        bgColor: prod.bgColor,
        age: prod.age,
      };
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  const handleScrollSlider = (direction: "left" | "right") => {
    if (recommendationSliderRef.current) {
      const scrollAmount = 320;
      recommendationSliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // 5. Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * appliedDiscount;
  const shipping = subtotal > 0 ? 0 : 0; // FREE Shipping as per design
  const estimatedTax = (subtotal - discountAmount) * 0.08; // 8% Tax
  const total = subtotal - discountAmount + shipping + estimatedTax;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* 2-Column Main Layout: Cart List on Left, Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-start">
        
        {/* LEFT COLUMN: Shopping Cart Header & Product List */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
              Shopping Cart
            </h1>
            <p className="font-body text-muted-foreground text-xs sm:text-sm lg:text-base max-w-xl">
              Playful smart companions, selected for your little explorer to learn, play, and grow.
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white/80 rounded-3xl p-6 sm:p-8 text-center border-2 border-dashed border-border-strong my-6 sm:my-8">
              <p className="font-body text-muted-foreground text-base sm:text-lg mb-6">
                Your shopping cart is currently empty. Let's find some robots!
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center font-body font-bold text-white bg-primary hover:bg-primary-600 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-sm"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div>
              {/* Desktop/Tablet Headers - Hidden on small mobile */}
              <div className="hidden md:grid grid-cols-12 gap-4 items-center bg-[#FAF6ED] rounded-2xl px-6 py-4 text-xs font-bold text-muted-foreground tracking-wider uppercase font-body mb-4">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 sm:py-6 px-4 sm:px-6 items-center bg-[#FAF6ED] rounded-2xl shadow-sm transition-all duration-300"
                  >
                    {/* Item Image & Info */}
                    <div className="col-span-1 md:col-span-6 flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Playful Image Container */}
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 ${item.bgColor} rounded-2xl flex items-center justify-center p-2 border-2 border-white shadow-sm flex-shrink-0 transition-transform duration-300 hover:scale-105`}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="object-contain max-h-full"
                          priority
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-sm sm:text-base lg:text-lg font-bold text-foreground mb-1 leading-tight">
                          {item.name}
                        </h3>
                        <p className="font-body text-xs sm:text-sm text-muted-foreground mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span>{item.category}</span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-border-strong flex-shrink-0"></span>
                          <span className="font-semibold text-primary-900 flex-shrink-0">{item.age}</span>
                        </p>
                        
                        {/* Remove Action */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="inline-flex items-center font-body text-xs text-danger hover:text-danger-bg font-semibold transition-colors duration-200"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="col-span-1 md:col-span-3 flex justify-between md:justify-center items-center py-2 md:py-0 border-t border-border/40 md:border-none">
                      <span className="md:hidden font-body text-xs sm:text-sm text-muted-foreground font-semibold">Quantity</span>
                      
                      <div className="flex items-center">
                        {/* Minus Button */}
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-border-strong flex items-center justify-center text-foreground hover:bg-white hover:border-foreground active:scale-90 transition-all duration-200"
                          aria-label="Decrease quantity"
                        >
                          <svg
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                          </svg>
                        </button>
                        
                        {/* Quantity Value */}
                        <span className="font-body font-bold text-sm sm:text-base text-foreground w-8 sm:w-10 text-center">
                          {item.quantity}
                        </span>

                        {/* Plus Button */}
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-border-strong flex items-center justify-center text-foreground hover:bg-white hover:border-foreground active:scale-90 transition-all duration-200"
                          aria-label="Increase quantity"
                        >
                          <svg
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center py-2 md:py-0 border-t border-border/40 md:border-none">
                      <span className="md:hidden font-body text-xs sm:text-sm text-muted-foreground font-semibold">Subtotal</span>
                      <span className="font-heading font-bold text-base sm:text-lg text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-6 border-t border-border flex justify-start">
                <Link
                  href="/"
                  className="inline-flex items-center font-body text-xs sm:text-sm font-bold text-primary hover:text-primary-700 transition-colors duration-200 group"
                >
                  <svg
                    className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Order Summary Card */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 w-full">
          <div className="bg-[#FAF6ED] rounded-3xl p-5 sm:p-6 lg:p-8 shadow-sm">
            <h2 className="font-heading text-lg sm:text-xl lg:text-2xl font-extrabold text-foreground mb-4 sm:mb-6 pb-2 border-b border-border">
              Order Summary
            </h2>

            <div className="space-y-3 sm:space-y-4 mb-6">
              {/* Subtotal */}
              <div className="flex justify-between font-body text-xs sm:text-sm lg:text-base text-foreground">
                <span>Subtotal</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>

              {/* Coupon Discount (if applied) */}
              {appliedDiscount > 0 && (
                <div className="flex justify-between font-body text-xs sm:text-sm lg:text-base text-success font-semibold">
                  <span>Discount (15%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="flex justify-between font-body text-xs sm:text-sm lg:text-base text-foreground">
                <span>Shipping</span>
                <span className="font-bold text-success uppercase text-xs sm:text-sm bg-success-bg/20 px-2 py-0.5 rounded">
                  Free
                </span>
              </div>

              {/* Estimated Tax */}
              <div className="flex justify-between font-body text-xs sm:text-sm lg:text-base text-foreground">
                <span>Estimated Tax</span>
                <span className="font-bold">${estimatedTax.toFixed(2)}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-3 sm:pt-4">
                {/* Total */}
                <div className="flex justify-between items-end">
                  <span className="font-heading text-sm sm:text-base lg:text-lg font-bold text-foreground">Total</span>
                  <span className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-primary-900 leading-none">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Coupon Code Form */}
            <form onSubmit={handleApplyCoupon} className="mb-6">
              <label htmlFor="coupon" className="block font-body text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Coupon Code
              </label>
              <div className="flex gap-2 items-center w-full">
                <input
                  type="text"
                  id="coupon"
                  placeholder="Enter code (ROBO15)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 min-w-0 font-body text-xs sm:text-sm border-2 border-border-strong rounded-full px-3 sm:px-4 py-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary bg-background/30"
                />
                <button 
                  type="submit" 
                  className="flex-shrink-0 font-body font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full bg-[#D5C9AE] text-[#3D2900] hover:opacity-90 transition-colors duration-200 shadow-sm active:scale-95 whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              
              {/* Feedback messages */}
              {couponError && (
                <p className="font-body text-xs text-danger font-semibold mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
                  {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="font-body text-xs text-success font-semibold mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                  {couponSuccess}
                </p>
              )}
            </form>

            {/* Proceed to Checkout Button */}
            <button
              onClick={() => alert("Proceeding to checkout mock sequence...")}
              className="w-full font-body font-extrabold text-white bg-[#2483D0] hover:bg-primary-600 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-md flex items-center justify-center gap-2 mb-4 cursor-pointer text-sm sm:text-base lg:text-lg"
            >
              Proceed to Checkout
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

            {/* Payment Icons */}
            <div className="flex justify-center items-center gap-3 sm:gap-4 py-2 opacity-70 hover:opacity-100 transition-opacity duration-300">
              {/* Visa */}
              <svg className="w-7 sm:w-8 h-5 text-muted-foreground" viewBox="0 0 48 30" fill="currentColor">
                <rect width="48" height="30" rx="4" fill="#F7F7F7" />
                <path d="M17.18 19.34l2.12-11.4h3.33l-2.12 11.4zM32.8 8.16a7.84 7.84 0 00-2.82-.51c-3.1 0-5.28 1.54-5.3 3.75-.02 1.63 1.56 2.54 2.74 3.09 1.2.56 1.62.92 1.6 1.43-.02.77-1 .12-1.38-.07l-.37-.17-.39 2.27c.66.29 1.88.54 3.12.55 3.3 0 5.43-1.53 5.47-3.9.04-1.3-.8-2.29-2.58-3.09-1.08-.52-1.74-.87-1.72-1.4.02-.48.58-.99 1.84-.99a6.29 6.29 0 012.4.45l.28.13.38-2.22c-.62-.24-1.7-.43-2.67-.43zm7.04.14c-.74 0-1.37.4-1.65 1.04l-5.2 11.66c-.03.07.03.11.09.11h3.48c.1 0 .19-.06.22-.14l.7-1.78h4.24c.1.09.22.14.33.14h3.07a.06.06 0 00.06-.08l-2.63-10.95c-.2-.79-.86-1-1.63-1H39.84z" fill="#1A1F71" />
              </svg>
              {/* Mastercard */}
              <svg className="w-7 sm:w-8 h-5 text-muted-foreground" viewBox="0 0 48 30" fill="currentColor">
                <rect width="48" height="30" rx="4" fill="#F7F7F7" />
                <circle cx="20" cy="15" r="8" fill="#EB001B" opacity="0.85" />
                <circle cx="28" cy="15" r="8" fill="#F79E1B" opacity="0.85" />
              </svg>
              {/* PayPal */}
              <svg className="w-7 sm:w-8 h-5 text-muted-foreground" viewBox="0 0 48 30" fill="currentColor">
                <rect width="48" height="30" rx="4" fill="#F7F7F7" />
                <path d="M32.06 9.8c0-1.8-1.5-2.7-3.6-2.7H20.7c-.5 0-.8.3-.9.8L16.4 22.8c0 .2.2.4.4.4h3.5c.4 0 .7-.3.8-.7l1-5.7c0-.2.3-.4.5-.4h1.7c3.2 0 5.7-1.3 6.4-5 .3-1.1.3-1.6.3-1.6z" fill="#003087" />
                <path d="M29.56 12.8c0-1.8-1.5-2.7-3.6-2.7H18.2c-.5 0-.8.3-.9.8L13.9 25.8c0 .2.2.4.4.4h3.5c.4 0 .7-.3.8-.7l1-5.7c0-.2.3-.4.5-.4h1.7c3.2 0 5.7-1.3 6.4-5 .3-1.1.3-1.6.3-1.6z" fill="#0079C1" opacity="0.75" />
              </svg>
              {/* Apple Pay */}
              <svg className="w-7 sm:w-8 h-5 text-muted-foreground" viewBox="0 0 48 30" fill="currentColor">
                <rect width="48" height="30" rx="4" fill="#F7F7F7" />
                <path d="M19.14 18.06c-.63 0-1.22-.3-1.54-.85-.31-.53-.41-1.27-.41-2.2 0-.9.1-1.62.4-2.16.32-.55.9-.86 1.54-.86.64 0 1.15.31 1.43.83.27.53.37 1.25.37 2.19 0 .91-.1 1.66-.37 2.2a1.64 1.64 0 01-1.42.85zm0-6.7c-1.3 0-2.27.84-2.27 2.5v1c0 1.68.96 2.5 2.27 2.5 1.3 0 2.24-.82 2.24-2.5v-1c0-1.66-.94-2.5-2.24-2.5zM27.2 13.97l.03 3.96h-1.53v-5.26c0-.98-.44-1.47-1.25-1.47-.64 0-1.1.33-1.27.91v5.82h-1.52V9.06h1.44v.93c.3-.64.91-1.03 1.76-1.03 1.57 0 2.36.98 2.36 2.51v2.5zM35.6 13.97l.03 3.96h-1.53v-5.26c0-.98-.45-1.47-1.25-1.47-.64 0-1.1.33-1.27.91v5.82H30.1V9.06h1.43v.93c.31-.64.92-1.03 1.77-1.03 1.57 0 2.36.98 2.36 2.51v2.5zM12.95 10.97c-.03-.26-.14-.52-.3-.72a1.35 1.35 0 00-.91-.45c-.32.02-.68.17-1.02.43-.31.25-.56.55-.71.86a2.6 2.6 0 00.95-1.14c.22-.3.38-.63.42-.99.04-.32-.01-.64-.17-.92a1.27 1.27 0 00-.83-.62c-.37-.08-.77.06-1.13.33-.3.22-.57.53-.74.88-.36-.45-.96-.7-1.59-.7a2.53 2.53 0 00-2.4 2.66c0 1.98 1.48 3.52 3.82 3.52.88 0 1.63-.26 2.1-.64l1.83 2.87h1.79L12.95 11z" />
              </svg>
            </div>
          </div>

          {/* Guarantee Information below Card */}
          <div className="mt-4 bg-[#FAF6ED] rounded-3xl p-4 sm:p-5 border border-border flex items-start gap-3">
            <svg
              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
            <div>
              <h4 className="font-body text-xs font-bold text-primary-900 uppercase tracking-wide">
                ROBO-EDU GUARANTEE
              </h4>
              <p className="font-body text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                Every robotic toy is calibrated for fun and learning. Return within 90 days if it doesn't meet your expectations.{" "}
                <a href="#" className="underline font-bold text-foreground hover:text-primary transition-colors">
                  Details
                </a>
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* RECOMMENDATIONS SECTION */}
      <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border-strong/50">
        
        {/* Recommendations Header with Slider Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 sm:mb-12 lg:mb-14">
          {/* Title + Underline Accent */}
          <div className="relative inline-block pb-6 sm:pb-8 lg:pb-10">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              You might like
            </h2>
            <Image
              src="/images/line.png"
              alt=""
              width={200}
              height={82}
              className="absolute left-1/2 -translate-x-1/2 w-40 top-8 -bottom-3 sm:left-3 sm:translate-x-0 sm:w-44 sm:top-8 sm:-bottom-4 lg:left-1/2 lg:-translate-x-1/2 lg:w-44 lg:top-10 lg:-bottom-3 h-auto object-contain pointer-events-none"
            />
          </div>

          {/* Circular slider arrows */}
          <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
            <button
              onClick={() => handleScrollSlider("left")}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-border-strong flex items-center justify-center bg-white text-foreground hover:border-foreground hover:bg-muted active:scale-90 transition-all duration-200 shadow-sm"
              aria-label="Scroll left"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <button
              onClick={() => handleScrollSlider("right")}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-border-strong flex items-center justify-center bg-white text-foreground hover:border-foreground hover:bg-muted active:scale-90 transition-all duration-200 shadow-sm"
              aria-label="Scroll right"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal Card Slider Container */}
        <div
          ref={recommendationSliderRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none scroll-smooth snap-x snap-mandatory"
        >
          {recommendedProducts.map((prod) => {
            const isWishlisted = wishlist.includes(prod.id);
            const activeColorIdx = selectedVariants[prod.id] || 0;

            return (
              <div
                key={prod.id}
                className="w-64 sm:w-72 flex-shrink-0 bg-white rounded-3xl p-4 shadow-sm border border-border hover:shadow-md hover:scale-[1.01] transition-all duration-300 relative snap-start group"
              >
                {/* Floating Discount Badge (top left) */}
                {prod.discount && (
                  <div className="absolute top-6 left-6 z-10 font-body text-xs font-bold text-danger bg-danger-bg/50 px-2 py-0.5 rounded-full shadow-sm">
                    {prod.discount}
                  </div>
                )}

                {/* Floating Wishlist Heart Button (top right) */}
                <button
                  onClick={() => handleAddToWishlist(prod.id)}
                  className="absolute top-6 right-6 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center shadow-md border border-border hover:scale-105 active:scale-90 transition-transform duration-200 cursor-pointer"
                  aria-label="Toggle wishlist"
                >
                  {isWishlisted ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-danger-bg fill-danger" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-danger transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>

                {/* Playful Image Container */}
                <div
                  className={`w-full aspect-square ${prod.bgColor} rounded-2xl flex items-center justify-center p-6 border border-white relative overflow-hidden transition-transform duration-500`}
                >
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    width={200}
                    height={200}
                    className="object-contain max-h-full transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Floating Add to Cart Button (bottom right) */}
                  <button
                    onClick={() => handleAddRecommendedToCart(prod)}
                    className="absolute bottom-3 right-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                    aria-label={`Add ${prod.name} to cart`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Recommendation Details */}
                <div className="mt-4">
                  <h3 className="font-body text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                    {prod.name}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                    <span>{prod.category}</span>
                    <span className="inline-block w-1 h-1 rounded-full bg-border-strong"></span>
                    <span className="font-semibold text-primary-900">{prod.age}</span>
                  </p>

                  <div className="flex justify-between items-center">
                    {/* Price with Original Price Strikethrough */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-body font-bold text-sm sm:text-base text-foreground">
                        ${prod.price.toFixed(2)}
                      </span>
                      {prod.originalPrice > prod.price && (
                        <span className="font-body text-xs text-muted-foreground/60 line-through">
                          ${prod.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Color Dot Variants */}
                    <div className="flex items-center gap-1.5">
                      {prod.colors.map((color, colorIdx) => (
                        <button
                          key={colorIdx}
                          onClick={() =>
                            setSelectedVariants((prev) => ({ ...prev, [prod.id]: colorIdx }))
                          }
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border shadow-sm transition-all duration-200 ${
                            activeColorIdx === colorIdx ? "scale-125 border-foreground" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select variant color ${colorIdx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
