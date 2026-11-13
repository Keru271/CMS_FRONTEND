// Autonomously verified patch for WEB-10
diff --git a/app/(dashboard)/store-setup/page.tsx b/app/(dashboard)/store-setup/page.tsx
index 7dec756..aefdd5a 100644
--- a/app/(dashboard)/store-setup/page.tsx
+++ b/app/(dashboard)/store-setup/page.tsx
@@ -1,13 +1,11 @@
 'use client';
 
 import React, { Suspense } from 'react';
-import { useRouter } from 'next/navigation';
 import { useCMSContext } from '@/src/context/CMSContext';
 import { StoreSetup } from '@/src/components/cms/StoreSetup';
 import { StoreSetupData } from '@/src/types';
 
 function StoreSetupContent() {
-  const router = useRouter();
   const { merchantData, setMerchantData } = useCMSContext();
 
   const handleSaved = (updated: StoreSetupData) => {
@@ -27,10 +25,6 @@ function StoreSetupContent() {
         },
       });
     }
-    // Navigate to dashboard after saving
-    setTimeout(() => {
-      router.push('/dashboard');
-    }, 1500);
   };
 
   return (

