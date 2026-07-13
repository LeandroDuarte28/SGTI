export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  asset: {
    Tables: {
      Asset: {
        Row: {
          asset_tag: string
          assigned_to: string | null
          created_at: string
          id: string
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_value: number | null
          serial_number: string | null
          status: Database["asset"]["Enums"]["AssetStatus"]
          type: Database["asset"]["Enums"]["AssetType"]
          updated_at: string
          warranty_expires: string | null
        }
        Insert: {
          asset_tag: string
          assigned_to?: string | null
          created_at?: string
          id?: string
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          serial_number?: string | null
          status?: Database["asset"]["Enums"]["AssetStatus"]
          type: Database["asset"]["Enums"]["AssetType"]
          updated_at?: string
          warranty_expires?: string | null
        }
        Update: {
          asset_tag?: string
          assigned_to?: string | null
          created_at?: string
          id?: string
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          serial_number?: string | null
          status?: Database["asset"]["Enums"]["AssetStatus"]
          type?: Database["asset"]["Enums"]["AssetType"]
          updated_at?: string
          warranty_expires?: string | null
        }
        Relationships: []
      }
      AssetMaintenanceRecord: {
        Row: {
          asset_id: string
          cost: number | null
          created_at: string
          description: string
          id: string
          performed_at: string
          performed_by: string | null
        }
        Insert: {
          asset_id: string
          cost?: number | null
          created_at?: string
          description: string
          id?: string
          performed_at?: string
          performed_by?: string | null
        }
        Update: {
          asset_id?: string
          cost?: number | null
          created_at?: string
          description?: string
          id?: string
          performed_at?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AssetMaintenanceRecord_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "Asset"
            referencedColumns: ["id"]
          },
        ]
      }
      LicenseAssignment: {
        Row: {
          assigned_at: string
          license_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          license_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          license_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "LicenseAssignment_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "SoftwareLicense"
            referencedColumns: ["id"]
          },
        ]
      }
      SoftwareLicense: {
        Row: {
          annual_cost: number | null
          created_at: string
          expires_at: string | null
          id: string
          license_key: string | null
          purchase_date: string | null
          seats_total: number
          seats_used: number
          software_name: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          annual_cost?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          license_key?: string | null
          purchase_date?: string | null
          seats_total: number
          seats_used?: number
          software_name: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          annual_cost?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          license_key?: string | null
          purchase_date?: string | null
          seats_total?: number
          seats_used?: number
          software_name?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AssetStatus: "IN_USE" | "IN_STOCK" | "IN_MAINTENANCE" | "RETIRED" | "LOST"
      AssetType:
        | "HARDWARE"
        | "SOFTWARE_LICENSE"
        | "PERIPHERAL"
        | "NETWORK_EQUIPMENT"
        | "MOBILE_DEVICE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  catalog: {
    Tables: {
      ServiceCatalogItem: {
        Row: {
          category_id: string
          created_at: string
          default_sla_id: string | null
          description: string | null
          estimated_delivery_days: number | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          default_sla_id?: string | null
          description?: string | null
          estimated_delivery_days?: number | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          default_sla_id?: string | null
          description?: string | null
          estimated_delivery_days?: number | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ServiceCatalogItem_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ServiceCategory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ServiceCatalogItem_default_sla_id_fkey"
            columns: ["default_sla_id"]
            isOneToOne: false
            referencedRelation: "SLADefinition"
            referencedColumns: ["id"]
          },
        ]
      }
      ServiceCategory: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      SLADefinition: {
        Row: {
          business_hours_only: boolean
          created_at: string
          id: string
          is_active: boolean
          name: string
          priority: Database["catalog"]["Enums"]["TicketPriority"]
          resolution_time_minutes: number
          response_time_minutes: number
          updated_at: string
        }
        Insert: {
          business_hours_only?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          priority: Database["catalog"]["Enums"]["TicketPriority"]
          resolution_time_minutes: number
          response_time_minutes: number
          updated_at?: string
        }
        Update: {
          business_hours_only?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          priority?: Database["catalog"]["Enums"]["TicketPriority"]
          resolution_time_minutes?: number
          response_time_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      TicketPriority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  compliance: {
    Tables: {
      AuditCycle: {
        Row: {
          completed_at: string | null
          created_by: string | null
          due_at: string | null
          framework: string | null
          id: string
          name: string
          started_at: string
        }
        Insert: {
          completed_at?: string | null
          created_by?: string | null
          due_at?: string | null
          framework?: string | null
          id?: string
          name: string
          started_at?: string
        }
        Update: {
          completed_at?: string | null
          created_by?: string | null
          due_at?: string | null
          framework?: string | null
          id?: string
          name?: string
          started_at?: string
        }
        Relationships: []
      }
      Control: {
        Row: {
          category: string | null
          code: string
          created_at: string
          description: string | null
          framework: string | null
          id: string
          owner_id: string | null
          status: Database["compliance"]["Enums"]["ControlStatus"]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          owner_id?: string | null
          status?: Database["compliance"]["Enums"]["ControlStatus"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          owner_id?: string | null
          status?: Database["compliance"]["Enums"]["ControlStatus"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      Evidence: {
        Row: {
          control_id: string | null
          description: string | null
          id: string
          non_conformance_id: string | null
          storage_path: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          control_id?: string | null
          description?: string | null
          id?: string
          non_conformance_id?: string | null
          storage_path: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          control_id?: string | null
          description?: string | null
          id?: string
          non_conformance_id?: string | null
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Evidence_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "Control"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Evidence_non_conformance_id_fkey"
            columns: ["non_conformance_id"]
            isOneToOne: false
            referencedRelation: "NonConformance"
            referencedColumns: ["id"]
          },
        ]
      }
      NonConformance: {
        Row: {
          audit_cycle_id: string | null
          control_id: string | null
          created_at: string
          description: string
          id: string
          identified_by: string | null
          owner_id: string | null
          resolved_at: string | null
          severity: Database["compliance"]["Enums"]["NonConformanceSeverity"]
          status: Database["compliance"]["Enums"]["NonConformanceStatus"]
          updated_at: string
        }
        Insert: {
          audit_cycle_id?: string | null
          control_id?: string | null
          created_at?: string
          description: string
          id?: string
          identified_by?: string | null
          owner_id?: string | null
          resolved_at?: string | null
          severity: Database["compliance"]["Enums"]["NonConformanceSeverity"]
          status?: Database["compliance"]["Enums"]["NonConformanceStatus"]
          updated_at?: string
        }
        Update: {
          audit_cycle_id?: string | null
          control_id?: string | null
          created_at?: string
          description?: string
          id?: string
          identified_by?: string | null
          owner_id?: string | null
          resolved_at?: string | null
          severity?: Database["compliance"]["Enums"]["NonConformanceSeverity"]
          status?: Database["compliance"]["Enums"]["NonConformanceStatus"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "NonConformance_audit_cycle_id_fkey"
            columns: ["audit_cycle_id"]
            isOneToOne: false
            referencedRelation: "AuditCycle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "NonConformance_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "Control"
            referencedColumns: ["id"]
          },
        ]
      }
      Policy: {
        Row: {
          content: string | null
          created_at: string
          effective_date: string | null
          id: string
          owner_id: string | null
          review_date: string | null
          status: Database["compliance"]["Enums"]["PolicyStatus"]
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          effective_date?: string | null
          id?: string
          owner_id?: string | null
          review_date?: string | null
          status?: Database["compliance"]["Enums"]["PolicyStatus"]
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          effective_date?: string | null
          id?: string
          owner_id?: string | null
          review_date?: string | null
          status?: Database["compliance"]["Enums"]["PolicyStatus"]
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ControlStatus:
        | "COMPLIANT"
        | "NON_COMPLIANT"
        | "IN_REMEDIATION"
        | "NOT_APPLICABLE"
      NonConformanceSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
      NonConformanceStatus:
        | "OPEN"
        | "IN_REMEDIATION"
        | "RESOLVED"
        | "ACCEPTED_RISK"
      PolicyStatus: "DRAFT" | "ACTIVE" | "UNDER_REVIEW" | "RETIRED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  financial: {
    Tables: {
      Budget: {
        Row: {
          allocated_amount: number
          category: Database["financial"]["Enums"]["ExpenseCategory"]
          created_at: string
          fiscal_year: number
          id: string
          name: string
          owner_id: string | null
          spent_amount: number
          updated_at: string
        }
        Insert: {
          allocated_amount: number
          category: Database["financial"]["Enums"]["ExpenseCategory"]
          created_at?: string
          fiscal_year: number
          id?: string
          name: string
          owner_id?: string | null
          spent_amount?: number
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          category?: Database["financial"]["Enums"]["ExpenseCategory"]
          created_at?: string
          fiscal_year?: number
          id?: string
          name?: string
          owner_id?: string | null
          spent_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      Contract: {
        Row: {
          category: Database["financial"]["Enums"]["ExpenseCategory"]
          created_at: string
          end_date: string | null
          id: string
          owner_id: string | null
          renewal_notice_days: number | null
          start_date: string
          status: Database["financial"]["Enums"]["ContractStatus"]
          title: string
          updated_at: string
          value: number
          vendor_name: string
        }
        Insert: {
          category: Database["financial"]["Enums"]["ExpenseCategory"]
          created_at?: string
          end_date?: string | null
          id?: string
          owner_id?: string | null
          renewal_notice_days?: number | null
          start_date: string
          status?: Database["financial"]["Enums"]["ContractStatus"]
          title: string
          updated_at?: string
          value: number
          vendor_name: string
        }
        Update: {
          category?: Database["financial"]["Enums"]["ExpenseCategory"]
          created_at?: string
          end_date?: string | null
          id?: string
          owner_id?: string | null
          renewal_notice_days?: number | null
          start_date?: string
          status?: Database["financial"]["Enums"]["ContractStatus"]
          title?: string
          updated_at?: string
          value?: number
          vendor_name?: string
        }
        Relationships: []
      }
      Expense: {
        Row: {
          amount: number
          approved_by: string | null
          budget_id: string | null
          contract_id: string | null
          created_at: string
          description: string
          expense_date: string
          id: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          budget_id?: string | null
          contract_id?: string | null
          created_at?: string
          description: string
          expense_date?: string
          id?: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          budget_id?: string | null
          contract_id?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Expense_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "Budget"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Expense_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "Contract"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ContractStatus: "ACTIVE" | "EXPIRED" | "TERMINATED" | "PENDING_RENEWAL"
      ExpenseCategory: "OPEX" | "CAPEX"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  identity: {
    Tables: {
      AccessRequest: {
        Row: {
          access_level: string
          created_at: string
          id: string
          justification: string
          requester_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["identity"]["Enums"]["AccessRequestStatus"]
          system_name: string
        }
        Insert: {
          access_level: string
          created_at?: string
          id?: string
          justification: string
          requester_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["identity"]["Enums"]["AccessRequestStatus"]
          system_name: string
        }
        Update: {
          access_level?: string
          created_at?: string
          id?: string
          justification?: string
          requester_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["identity"]["Enums"]["AccessRequestStatus"]
          system_name?: string
        }
        Relationships: []
      }
      AccessReviewCycle: {
        Row: {
          completed_at: string | null
          created_by: string | null
          due_at: string
          id: string
          name: string
          started_at: string
        }
        Insert: {
          completed_at?: string | null
          created_by?: string | null
          due_at: string
          id?: string
          name: string
          started_at?: string
        }
        Update: {
          completed_at?: string | null
          created_by?: string | null
          due_at?: string
          id?: string
          name?: string
          started_at?: string
        }
        Relationships: []
      }
      AccessReviewItem: {
        Row: {
          cycle_id: string
          decided_at: string | null
          decision: Database["identity"]["Enums"]["AccessReviewDecision"]
          id: string
          notes: string | null
          reviewer_id: string
          system_access_id: string
        }
        Insert: {
          cycle_id: string
          decided_at?: string | null
          decision?: Database["identity"]["Enums"]["AccessReviewDecision"]
          id?: string
          notes?: string | null
          reviewer_id: string
          system_access_id: string
        }
        Update: {
          cycle_id?: string
          decided_at?: string | null
          decision?: Database["identity"]["Enums"]["AccessReviewDecision"]
          id?: string
          notes?: string | null
          reviewer_id?: string
          system_access_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "AccessReviewItem_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "AccessReviewCycle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AccessReviewItem_system_access_id_fkey"
            columns: ["system_access_id"]
            isOneToOne: false
            referencedRelation: "SystemAccess"
            referencedColumns: ["id"]
          },
        ]
      }
      SystemAccess: {
        Row: {
          access_level: string
          granted_at: string
          granted_by: string | null
          id: string
          revoked_at: string | null
          system_name: string
          user_id: string
        }
        Insert: {
          access_level: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          revoked_at?: string | null
          system_name: string
          user_id: string
        }
        Update: {
          access_level?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          revoked_at?: string | null
          system_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AccessRequestStatus: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED"
      AccessReviewDecision: "CONFIRMED" | "REVOKE" | "PENDING"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  knowledge: {
    Tables: {
      Article: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          id: string
          slug: string
          status: Database["knowledge"]["Enums"]["ArticleStatus"]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          id?: string
          slug: string
          status?: Database["knowledge"]["Enums"]["ArticleStatus"]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          id?: string
          slug?: string
          status?: Database["knowledge"]["Enums"]["ArticleStatus"]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      ArticleFeedback: {
        Row: {
          article_id: string
          comment: string | null
          created_at: string
          id: string
          is_helpful: boolean
          user_id: string | null
        }
        Insert: {
          article_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_helpful: boolean
          user_id?: string | null
        }
        Update: {
          article_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_helpful?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ArticleFeedback_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "Article"
            referencedColumns: ["id"]
          },
        ]
      }
      ArticleVersion: {
        Row: {
          article_id: string
          content: string
          created_at: string
          edited_by: string | null
          id: string
          version_number: number
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          edited_by?: string | null
          id?: string
          version_number: number
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          edited_by?: string | null
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ArticleVersion_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "Article"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ArticleStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  procurement: {
    Tables: {
      PurchaseOrder: {
        Row: {
          approved_by: string | null
          created_at: string
          id: string
          notes: string | null
          requested_by: string
          status: Database["procurement"]["Enums"]["PurchaseOrderStatus"]
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requested_by: string
          status?: Database["procurement"]["Enums"]["PurchaseOrderStatus"]
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          requested_by?: string
          status?: Database["procurement"]["Enums"]["PurchaseOrderStatus"]
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "PurchaseOrder_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "Supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      PurchaseOrderItem: {
        Row: {
          description: string
          id: string
          purchase_order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          purchase_order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          description?: string
          id?: string
          purchase_order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "PurchaseOrderItem_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "PurchaseOrder"
            referencedColumns: ["id"]
          },
        ]
      }
      ReceivingRecord: {
        Row: {
          id: string
          notes: string | null
          purchase_order_id: string
          received_at: string
          received_by: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          purchase_order_id: string
          received_at?: string
          received_by?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          purchase_order_id?: string
          received_at?: string
          received_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ReceivingRecord_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "PurchaseOrder"
            referencedColumns: ["id"]
          },
        ]
      }
      Supplier: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      PurchaseOrderStatus:
        | "DRAFT"
        | "PENDING_APPROVAL"
        | "APPROVED"
        | "ORDERED"
        | "RECEIVED"
        | "CANCELLED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  project: {
    Tables: {
      GithubReference: {
        Row: {
          created_at: string
          id: string
          project_id: string
          ref_type: Database["project"]["Enums"]["GithubRefType"]
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          ref_type: Database["project"]["Enums"]["GithubRefType"]
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          ref_type?: Database["project"]["Enums"]["GithubRefType"]
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "GithubReference_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      Milestone: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          project_id: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          project_id: string
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "Milestone_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      Project: {
        Row: {
          budget_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          github_repo: string | null
          id: string
          name: string
          owner_id: string | null
          start_date: string | null
          status: Database["project"]["Enums"]["ProjectStatus"]
          updated_at: string
        }
        Insert: {
          budget_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_repo?: string | null
          id?: string
          name: string
          owner_id?: string | null
          start_date?: string | null
          status?: Database["project"]["Enums"]["ProjectStatus"]
          updated_at?: string
        }
        Update: {
          budget_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_repo?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          start_date?: string | null
          status?: Database["project"]["Enums"]["ProjectStatus"]
          updated_at?: string
        }
        Relationships: []
      }
      Risk: {
        Row: {
          created_at: string
          description: string
          id: string
          impact: Database["project"]["Enums"]["RiskLevel"]
          is_resolved: boolean
          mitigation: string | null
          probability: Database["project"]["Enums"]["RiskLevel"]
          project_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          impact: Database["project"]["Enums"]["RiskLevel"]
          is_resolved?: boolean
          mitigation?: string | null
          probability: Database["project"]["Enums"]["RiskLevel"]
          project_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          impact?: Database["project"]["Enums"]["RiskLevel"]
          is_resolved?: boolean
          mitigation?: string | null
          probability?: Database["project"]["Enums"]["RiskLevel"]
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Risk_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      GithubRefType: "ISSUE" | "PULL_REQUEST" | "COMMIT"
      ProjectStatus:
        | "PLANNING"
        | "IN_PROGRESS"
        | "ON_HOLD"
        | "COMPLETED"
        | "CANCELLED"
      RiskLevel: "LOW" | "MEDIUM" | "HIGH"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _health_check: {
        Row: {
          checked_at: string
          id: number
        }
        Insert: {
          checked_at?: string
          id?: number
        }
        Update: {
          checked_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  shared: {
    Tables: {
      AuditLog: {
        Row: {
          action: string
          correlation_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          correlation_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          correlation_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AuditLog_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
      Notification: {
        Row: {
          body: string
          channel: Database["shared"]["Enums"]["NotificationChannel"]
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          link: string | null
          read_at: string | null
          status: Database["shared"]["Enums"]["NotificationStatus"]
          title: string
          user_id: string
        }
        Insert: {
          body: string
          channel?: Database["shared"]["Enums"]["NotificationChannel"]
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          status?: Database["shared"]["Enums"]["NotificationStatus"]
          title: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: Database["shared"]["Enums"]["NotificationChannel"]
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          status?: Database["shared"]["Enums"]["NotificationStatus"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Notification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
      UserProfile: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          email: string
          full_name: string
          google_id: string | null
          id: string
          is_active: boolean
          job_title: string | null
          last_login_at: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email: string
          full_name: string
          google_id?: string | null
          id: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string
          full_name?: string
          google_id?: string | null
          id?: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      UserRole: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["shared"]["Enums"]["SystemRole"]
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["shared"]["Enums"]["SystemRole"]
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["shared"]["Enums"]["SystemRole"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserRole_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "UserRole_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "UserProfile"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: { _roles: Database["shared"]["Enums"]["SystemRole"][] }
        Returns: boolean
      }
      has_role: {
        Args: { _role: Database["shared"]["Enums"]["SystemRole"] }
        Returns: boolean
      }
      is_it_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      NotificationChannel: "IN_APP" | "EMAIL"
      NotificationStatus: "UNREAD" | "READ" | "DISMISSED"
      SystemRole:
        | "SUPER_ADMIN"
        | "IT_MANAGER"
        | "IT_ANALYST"
        | "IT_TECHNICIAN"
        | "AUDITOR"
        | "END_USER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  ticket: {
    Tables: {
      EscalationRecord: {
        Row: {
          escalated_at: string
          escalated_to: string
          id: string
          incident_id: string
          reason: string
          resolved_at: string | null
        }
        Insert: {
          escalated_at?: string
          escalated_to: string
          id?: string
          incident_id: string
          reason: string
          resolved_at?: string | null
        }
        Update: {
          escalated_at?: string
          escalated_to?: string
          id?: string
          incident_id?: string
          reason?: string
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "EscalationRecord_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "Incident"
            referencedColumns: ["id"]
          },
        ]
      }
      Incident: {
        Row: {
          assignee_id: string | null
          category_id: string | null
          closed_at: string | null
          created_at: string
          description: string
          id: string
          priority: Database["catalog"]["Enums"]["TicketPriority"]
          reporter_id: string
          resolved_at: string | null
          sla_id: string | null
          status: Database["ticket"]["Enums"]["TicketStatus"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string
          description: string
          id?: string
          priority: Database["catalog"]["Enums"]["TicketPriority"]
          reporter_id: string
          resolved_at?: string | null
          sla_id?: string | null
          status?: Database["ticket"]["Enums"]["TicketStatus"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: Database["catalog"]["Enums"]["TicketPriority"]
          reporter_id?: string
          resolved_at?: string | null
          sla_id?: string | null
          status?: Database["ticket"]["Enums"]["TicketStatus"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      IncidentProblemLink: {
        Row: {
          incident_id: string
          linked_at: string
          problem_id: string
        }
        Insert: {
          incident_id: string
          linked_at?: string
          problem_id: string
        }
        Update: {
          incident_id?: string
          linked_at?: string
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "IncidentProblemLink_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "Incident"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "IncidentProblemLink_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "Problem"
            referencedColumns: ["id"]
          },
        ]
      }
      Problem: {
        Row: {
          created_at: string
          description: string
          id: string
          is_known_error: boolean
          owner_id: string | null
          related_incident_count: number
          root_cause: string | null
          status: Database["ticket"]["Enums"]["TicketStatus"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_known_error?: boolean
          owner_id?: string | null
          related_incident_count?: number
          root_cause?: string | null
          status?: Database["ticket"]["Enums"]["TicketStatus"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_known_error?: boolean
          owner_id?: string | null
          related_incident_count?: number
          root_cause?: string | null
          status?: Database["ticket"]["Enums"]["TicketStatus"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ServiceRequest: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          catalog_item_id: string
          created_at: string
          fulfilled_at: string | null
          id: string
          justification: string | null
          requester_id: string
          status: Database["ticket"]["Enums"]["TicketStatus"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          catalog_item_id: string
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          justification?: string | null
          requester_id: string
          status?: Database["ticket"]["Enums"]["TicketStatus"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          catalog_item_id?: string
          created_at?: string
          fulfilled_at?: string | null
          id?: string
          justification?: string | null
          requester_id?: string
          status?: Database["ticket"]["Enums"]["TicketStatus"]
          updated_at?: string
        }
        Relationships: []
      }
      TicketComment: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
          ticket_type: Database["ticket"]["Enums"]["TicketType"]
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
          ticket_type: Database["ticket"]["Enums"]["TicketType"]
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
          ticket_type?: Database["ticket"]["Enums"]["TicketType"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      TicketStatus: "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED"
      TicketType: "INCIDENT" | "SERVICE_REQUEST" | "PROBLEM"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  asset: {
    Enums: {
      AssetStatus: ["IN_USE", "IN_STOCK", "IN_MAINTENANCE", "RETIRED", "LOST"],
      AssetType: [
        "HARDWARE",
        "SOFTWARE_LICENSE",
        "PERIPHERAL",
        "NETWORK_EQUIPMENT",
        "MOBILE_DEVICE",
      ],
    },
  },
  catalog: {
    Enums: {
      TicketPriority: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
    },
  },
  compliance: {
    Enums: {
      ControlStatus: [
        "COMPLIANT",
        "NON_COMPLIANT",
        "IN_REMEDIATION",
        "NOT_APPLICABLE",
      ],
      NonConformanceSeverity: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      NonConformanceStatus: [
        "OPEN",
        "IN_REMEDIATION",
        "RESOLVED",
        "ACCEPTED_RISK",
      ],
      PolicyStatus: ["DRAFT", "ACTIVE", "UNDER_REVIEW", "RETIRED"],
    },
  },
  financial: {
    Enums: {
      ContractStatus: ["ACTIVE", "EXPIRED", "TERMINATED", "PENDING_RENEWAL"],
      ExpenseCategory: ["OPEX", "CAPEX"],
    },
  },
  graphql_public: {
    Enums: {},
  },
  identity: {
    Enums: {
      AccessRequestStatus: ["PENDING", "APPROVED", "REJECTED", "REVOKED"],
      AccessReviewDecision: ["CONFIRMED", "REVOKE", "PENDING"],
    },
  },
  knowledge: {
    Enums: {
      ArticleStatus: ["DRAFT", "PUBLISHED", "ARCHIVED"],
    },
  },
  procurement: {
    Enums: {
      PurchaseOrderStatus: [
        "DRAFT",
        "PENDING_APPROVAL",
        "APPROVED",
        "ORDERED",
        "RECEIVED",
        "CANCELLED",
      ],
    },
  },
  project: {
    Enums: {
      GithubRefType: ["ISSUE", "PULL_REQUEST", "COMMIT"],
      ProjectStatus: [
        "PLANNING",
        "IN_PROGRESS",
        "ON_HOLD",
        "COMPLETED",
        "CANCELLED",
      ],
      RiskLevel: ["LOW", "MEDIUM", "HIGH"],
    },
  },
  public: {
    Enums: {},
  },
  shared: {
    Enums: {
      NotificationChannel: ["IN_APP", "EMAIL"],
      NotificationStatus: ["UNREAD", "READ", "DISMISSED"],
      SystemRole: [
        "SUPER_ADMIN",
        "IT_MANAGER",
        "IT_ANALYST",
        "IT_TECHNICIAN",
        "AUDITOR",
        "END_USER",
      ],
    },
  },
  ticket: {
    Enums: {
      TicketStatus: ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"],
      TicketType: ["INCIDENT", "SERVICE_REQUEST", "PROBLEM"],
    },
  },
} as const

